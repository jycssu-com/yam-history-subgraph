import { Address, BigInt, ethereum } from '@graphprotocol/graph-ts'
import { OfferCreated as OfferCreatedEvent } from '../../types/RealTokenYam/RealTokenYam'
import { Account, Offer, Token } from '../../types/schema'
import { createOfferPrice, createOfferQuantity, getAccount, getAccountMonth, getToken, getTokenDay, getTokenMonth } from '../utils'
import { isActiveOffer } from '../utils'
import { Statistics } from '../utils/statistics/Statistics'

function saveOnToken (address: Address, offerId: string, block: ethereum.Block): Token {
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

function saveOnAccount (address: Address, offerId: string, block: ethereum.Block): Account {
  const account = getAccount(address)
  const accountMonth = getAccountMonth(account, block.timestamp)

  const accountOffers = account.offers
  accountOffers.push(offerId)
  account.offers = accountOffers
  account.offersCount = BigInt.fromI32(accountOffers.length)
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

export function handleOfferCreated(event: OfferCreatedEvent): void {
  Statistics.initialize(event.block.timestamp)

  const offerId = event.params.offerId.toString()
  const offerPrice = createOfferPrice(offerId, event.params.price, event)
  const offerQuantity = createOfferQuantity(offerId, event.params.amount, 'OfferCreated', event)

  const offer = new Offer(offerId)
  offer.maker = event.params.seller.toHex()
  offer.offerToken = event.params.offerToken.toHex()
  offer.buyerToken = event.params.buyerToken.toHex()
  offer.transactions = []
  offer.transactionsCount = BigInt.fromI32(0)
  offer.createdAtBlock = event.block.number
  offer.createdAtTimestamp = event.block.timestamp
  offer.price = offerPrice.price
  offer.prices = [offerPrice.id]
  offer.pricesCount = BigInt.fromI32(1)
  offer.quantity = offerQuantity.quantity
  offer.quantities = [offerQuantity.id]
  offer.quantitiesCount = BigInt.fromI32(1)
  offer.isPrivate = false
  offer.isActive = isActiveOffer(offer)

  if (event.params.buyer.notEqual(Address.fromString('0x0000000000000000000000000000000000000000'))) {
    getAccount(event.params.buyer) // create account if not exists
    offer.taker = event.params.buyer.toHex()
    offer.isPrivate = true
  }

  saveOnAccount(event.params.seller, offerId, event.block)
  const offerToken = saveOnToken(event.params.offerToken, offerId, event.block)
  const buyerToken = saveOnToken(event.params.buyerToken, offerId, event.block)

  if (offerToken.type == 'REALTOKEN' && buyerToken.type == 'REALTOKEN') {
    offer.type = 'REALTOKENTOREALTOKEN'
  } else if (offerToken.type == 'REALTOKEN') {
    offer.type = 'REALTOKENTOERC20'
  } else if (buyerToken.type == 'REALTOKEN') {
    offer.type = 'ERC20TOREALTOKEN'
  } else {
    offer.type = 'ERC20TOERC20'
  }

  offer.save()

  Statistics.increaseOffersCount()

  if (offer.isActive) {
    Statistics.increaseActiveOffersCount()
  }

  if (offer.isPrivate) {
    Statistics.increasePrivateOffersCount()
  }

  Statistics.save()
}
