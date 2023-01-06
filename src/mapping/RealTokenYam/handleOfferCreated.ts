import { Address, BigInt, ethereum } from '@graphprotocol/graph-ts'
import { ERC20 } from '../../types/RealTokenYam/ERC20'
import { OfferCreated as OfferCreatedEvent } from '../../types/RealTokenYam/RealTokenYam'
import { Account, AccountAllowance, AccountBalance, Offer, Token } from '../../types/schema'
import { computeOfferFields, createOfferPrice, createOfferQuantity, getAccount, getAccountMonth, getToken, getTokenDay, getTokenMonth } from '../utils'
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

  updateRelatedAccount(event.params.seller, offer.id, event)
  const offerToken = updateRelatedToken(event.params.offerToken, offer.id, event.block)
  const buyerToken = updateRelatedToken(event.params.buyerToken, offer.id, event.block)
  
  computeOfferFields(offer)
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

  tokenDay.createdOffersCount = tokenDay.createdOffersCount.plus(BigInt.fromI32(1))
  tokenDay.save()

  tokenMonth.createdOffersCount = tokenMonth.createdOffersCount.plus(BigInt.fromI32(1))
  tokenMonth.save()

  return token
}

function updateRelatedAccount (address: Address, offerId: string, event: OfferCreatedEvent): Account {
  const account = getAccount(address)
  const accountMonth = getAccountMonth(account, event.block.timestamp)

  const accountOffers = account.offers
  accountOffers.push(offerId)
  account.offers = accountOffers
  account.offersCount = account.offersCount.plus(BigInt.fromI32(1))

  accountMonth.createdOffersCount = accountMonth.createdOffersCount.plus(BigInt.fromI32(1))
  accountMonth.save()

  updateAccountBalance(account, event)
  updateAccountAllowance(account, event)

  account.save()

  if (account.offersCount.equals(BigInt.fromI32(1))) {
    Statistics.increaseAccountsWithOffersCount()
  }
  return account
}

function updateAccountBalance (account: Account, event: OfferCreatedEvent): void {
  const tokenId = event.params.offerToken.toHex()
  const accountId = event.params.seller.toHex()
  const tokenContract = ERC20.bind(event.params.offerToken)
  const balance = tokenContract.try_balanceOf(event.params.seller)

  let accountBalance = AccountBalance.load(accountId + '-' + tokenId)

  if (accountBalance == null) {
    accountBalance = new AccountBalance(accountId + '-' + tokenId)
    accountBalance.account = accountId
    accountBalance.token = tokenId

    account.balancesCount = account.balancesCount.plus(BigInt.fromI32(1))
  }

  accountBalance.balance = balance.reverted ? BigInt.fromI32(0) : balance.value
  accountBalance.save()
}

function updateAccountAllowance (account: Account, event: OfferCreatedEvent): void {
  const tokenId = event.params.offerToken.toHex()
  const accountId = event.params.seller.toHex()
  const tokenContract = ERC20.bind(event.params.offerToken)
  const allowance = tokenContract.try_allowance(event.params.seller, event.address)

  let accountAllowance = AccountAllowance.load(accountId + '-' + tokenId)

  if (accountAllowance == null) {
    accountAllowance = new AccountAllowance(accountId + '-' + tokenId)
    accountAllowance.account = accountId
    accountAllowance.token = tokenId

    account.allowancesCount = account.allowancesCount.plus(BigInt.fromI32(1))
  }

  accountAllowance.allowance = allowance.reverted ? BigInt.fromI32(0) : allowance.value
  accountAllowance.save()
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
