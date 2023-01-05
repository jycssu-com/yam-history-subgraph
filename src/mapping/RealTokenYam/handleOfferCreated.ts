import { Address, BigInt, ethereum } from '@graphprotocol/graph-ts'
import { OfferCreated as OfferCreatedEvent } from '../../types/RealTokenYam/RealTokenYam'
import { Account, Offer, OfferPrice, OfferQuantity, Token } from '../../types/schema'
import { createOfferPrice, createOfferQuantity, getAccount, getAccountMonth, getToken, getTokenDay, getTokenMonth } from '../utils'
import { isActiveOffer } from '../utils'
import { Statistics } from '../utils/statistics/Statistics'

export function handleOfferCreated (event: OfferCreatedEvent): void {
  const offer = new Offer(event.params.offerId.toString())

  offer.maker = event.params.seller.toHex()
  offer.offerToken = event.params.offerToken.toHex()
  offer.buyerToken = event.params.buyerToken.toHex()
  offer.transactionsCount = BigInt.fromI32(0)
  offer.createdAtBlock = event.block.number
  offer.createdAtTimestamp = event.block.timestamp

  updateOfferPrice(offer, event)
  updateOfferQuantity(offer, event)
  updateOfferPrivateStatus(offer, event)

  updateRelatedAccount(event.params.seller, offer.id, event.block)
  const offerToken = updateRelatedToken(event.params.offerToken, offer.id, event.block)
  const buyerToken = updateRelatedToken(event.params.buyerToken, offer.id, event.block)
  
  offer.isActive = isActiveOffer(offer)
  offer.type = getOfferType(offerToken, buyerToken)
  offer.save()

  updateStatistics(offer)
}

function updateOfferPrice (offer: Offer, event: OfferCreatedEvent): void {
  const offerPrice = createOfferPrice(offer.id, event.params.price, event)
  offer.price = offerPrice.price
  offer.pricesCount = BigInt.fromI32(1)
}

function updateOfferQuantity (offer: Offer, event: OfferCreatedEvent): void {
  const offerQuantity = createOfferQuantity(offer.id, event.params.amount, 'OfferCreated', event)
  offer.quantity = offerQuantity.quantity
  offer.quantitiesCount = BigInt.fromI32(1)
}

function updateOfferPrivateStatus (offer: Offer, event: OfferCreatedEvent): void {
  if (event.params.buyer.notEqual(Address.fromString('0x0000000000000000000000000000000000000000'))) {
    const buyer = getAccount(event.params.buyer)
    offer.taker = buyer.address.toHex()
    offer.isPrivate = true
  } else {
    offer.isPrivate = false
  }
}

function updateRelatedToken (address: Address, offerId: string, block: ethereum.Block): Token {
  const token = getToken(address)
  const tokenDay = getTokenDay(token, block.timestamp)
  const tokenMonth = getTokenMonth(token, block.timestamp)

  const tokenOffers = token.offers
  tokenOffers.push(offerId)
  token.offers = tokenOffers
  token.offersCount = BigInt.fromI32(tokenOffers.length)
  token.save()

  const tokenDayCreatedOffers = tokenDay.createdOffers
  tokenDayCreatedOffers.push(offerId)
  tokenDay.createdOffers = tokenDayCreatedOffers
  tokenDay.createdOffersCount = BigInt.fromI32(tokenDayCreatedOffers.length)
  tokenDay.save()

  const tokenMonthCreatedOffers = tokenMonth.createdOffers
  tokenMonthCreatedOffers.push(offerId)
  tokenMonth.createdOffers = tokenMonthCreatedOffers
  tokenMonth.createdOffersCount = BigInt.fromI32(tokenMonthCreatedOffers.length)
  tokenMonth.save()

  return token
}

function updateRelatedAccount (address: Address, offerId: string, block: ethereum.Block): Account {
  const account = getAccount(address)
  const accountMonth = getAccountMonth(account, block.timestamp)

  account.offersCount = account.offersCount.plus(BigInt.fromI32(1))
  account.save()

  const accountMonthCreatedOffers = accountMonth.createdOffers
  accountMonthCreatedOffers.push(offerId)
  accountMonth.createdOffers = accountMonthCreatedOffers
  accountMonth.createdOffersCount = BigInt.fromI32(accountMonthCreatedOffers.length)
  accountMonth.save()

  if (account.offersCount.equals(BigInt.fromI32(1))) {
    Statistics.increaseAccountsWithOffersCount()
  }
  return account
}

function getOfferType (offerToken: Token, buyerToken: Token): string {
  if (offerToken.type == 'REALTOKEN' && buyerToken.type == 'REALTOKEN') {
    return 'REALTOKENTOREALTOKEN'
  }
  if (offerToken.type == 'REALTOKEN') {
    return 'REALTOKENTOERC20'
  }
  if (buyerToken.type == 'REALTOKEN') {
    return 'ERC20TOREALTOKEN'
  }
  return 'ERC20TOERC20'
}

function updateStatistics (offer: Offer): void {
  Statistics.increaseOffersCount()

  if (offer.isActive) {
    Statistics.increaseActiveOffersCount()
  }

  if (offer.isPrivate) {
    Statistics.increasePrivateOffersCount()
  }
}
