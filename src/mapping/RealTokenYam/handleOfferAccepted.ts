import { Address, BigInt, ethereum } from '@graphprotocol/graph-ts'
import { OfferAccepted as OfferAcceptedEvent } from '../../types/RealTokenYam/RealTokenYam'
import { Account, AccountAllowance, AccountMonth, Offer, OfferQuantity, Token, TokenVolume, TokenVolumeDay, TokenVolumeMonth, Transaction } from '../../types/schema'
import { computeOfferFields, createOfferQuantity, getAccount, getAccountMonth, getDay, getFullDay, getFullMonth, getMonth, getToken, getTokenDay, getTokenMonth, getYear } from '../utils'
import { Statistics } from '../utils/statistics/Statistics'

export function handleOfferAccepted(event: OfferAcceptedEvent): void {
  const offerId = event.params.offerId.toString()
  const offer = Offer.load(offerId)

  if (offer) {
    const wasActive = offer.isActive
    updateOfferQuantity(offer, event)
    const transaction = createOfferTransaction(offer, event)

    const offerTokenQuantity = event.params.amount
    const buyerTokenQuantity = getBuyerTokenQuantity(event.params.offerToken, event.params.amount, event.params.price)

    updateRelatedMakerAccount(transaction, event)
    updateRelatedTakerAccount(event.params.buyer, transaction, event)
    updateRelatedTokens(transaction.id, offerTokenQuantity, buyerTokenQuantity, event)

    computeOfferFields(offer, event.block)
    offer.save()

    updateStatistics(offer, offerTokenQuantity, buyerTokenQuantity, wasActive)
  }
}

function updateOfferQuantity (offer: Offer, event: OfferAcceptedEvent): OfferQuantity {
  const newQuantity = offer.quantity.minus(event.params.amount)
  const offerQuantity = createOfferQuantity(offer.id, newQuantity, 'OfferAccepted', event)
  offer.quantity = newQuantity
  offer.quantitiesCount = offer.quantitiesCount.plus(BigInt.fromI32(1))
  return offerQuantity
}

function createOfferTransaction (offer: Offer, event: OfferAcceptedEvent): Transaction {
  const transaction = createTransaction(offer, event)
  offer.transactionsCount = offer.transactionsCount.plus(BigInt.fromI32(1))
  return transaction
}

function createTransaction (offer: Offer, event: OfferAcceptedEvent): Transaction {
  const transactionId = event.transaction.hash.toHex() + event.logIndex.toString()
  const takerAddress = event.params.buyer
  const price = event.params.price
  const quantity = event.params.amount

  const transaction = new Transaction(transactionId)
  transaction.type = offer.type
  transaction.offer = offer.id
  transaction.taker = takerAddress.toHex()
  transaction.price = price
  transaction.quantity = quantity
  transaction.createdAtBlock = event.block.number
  transaction.createdAtTimestamp = event.block.timestamp
  transaction.save()

  Statistics.increaseTransactionsCount()

  return transaction
}

function getBuyerTokenQuantity (offerTokenAddress: Address, quantity: BigInt, price: BigInt): BigInt {
  const offerToken = getToken(offerTokenAddress)
  return quantity
    .times(price)
    .div(BigInt.fromI64(<i64>Math.pow(10, offerToken.decimals.toU32())))
}

function updateRelatedMakerAccount (transaction: Transaction, event: OfferAcceptedEvent): void {
  const offerMaker = getAccount(event.params.seller)
  const offerMakerMonth = getAccountMonth(offerMaker, event.block.timestamp)

  if (transaction.type == 'REALTOKENTOERC20') {
    addSaleOnAccount(transaction.id, offerMaker, offerMakerMonth)
  } else if (transaction.type == 'ERC20TOREALTOKEN') {
    addPurchaseOnAccount(transaction.id, offerMaker, offerMakerMonth)
  } else {
    addSwapOnAccount(transaction.id, offerMaker, offerMakerMonth)
  }

  addTransactionOnAccount(transaction.id, offerMaker, offerMakerMonth)

  const offerMakerAllowance = AccountAllowance.load(offerMaker.id + '-' + event.params.offerToken.toHex())
  if (offerMakerAllowance) {
    offerMakerAllowance.allowance = offerMakerAllowance.allowance.minus(event.params.amount)
    offerMakerAllowance.save()
  }

  updateAccountStatistics(offerMaker)

  offerMaker.save()
  offerMakerMonth.save()
}

function updateRelatedTakerAccount (address: Address, transaction: Transaction, event: ethereum.Event): void {
  const offerTaker = getAccount(address)
  const offerTakerMonth = getAccountMonth(offerTaker, event.block.timestamp)

  if (transaction.type == 'REALTOKENTOERC20') {
    addPurchaseOnAccount(transaction.id, offerTaker, offerTakerMonth)
  } else if (transaction.type == 'ERC20TOREALTOKEN') {
    addSaleOnAccount(transaction.id, offerTaker, offerTakerMonth)
  } else {
    addSwapOnAccount(transaction.id, offerTaker, offerTakerMonth)
  }

  addTransactionOnAccount(transaction.id, offerTaker, offerTakerMonth)
  updateAccountStatistics(offerTaker)

  offerTaker.save()
  offerTakerMonth.save()
}

function addPurchaseOnAccount (transactionId: string, account: Account, accountMonth: AccountMonth): void {
  const accountPurchase = account.purchases
  accountPurchase.push(transactionId)
  account.purchases = accountPurchase

  account.purchasesCount = account.purchasesCount.plus(BigInt.fromI32(1))
  accountMonth.purchasesCount = accountMonth.purchasesCount.plus(BigInt.fromI32(1))
}

function addSaleOnAccount (transactionId: string, account: Account, accountMonth: AccountMonth): void {
  const accountSales = account.sales
  accountSales.push(transactionId)
  account.sales = accountSales

  account.salesCount = account.salesCount.plus(BigInt.fromI32(1))
  accountMonth.salesCount = accountMonth.salesCount.plus(BigInt.fromI32(1))
}

function addSwapOnAccount (transactionId: string, account: Account, accountMonth: AccountMonth): void {
  const accountSwaps = account.swaps
  accountSwaps.push(transactionId)
  account.swaps = accountSwaps

  account.swapsCount = account.swapsCount.plus(BigInt.fromI32(1))
  accountMonth.swapsCount = accountMonth.swapsCount.plus(BigInt.fromI32(1))
}

function addTransactionOnAccount (transactionId: string, account: Account, accountMonth: AccountMonth): void {
  const accountTransactions = account.transactions
  accountTransactions.push(transactionId)
  account.transactions = accountTransactions

  account.transactionsCount = account.transactionsCount.plus(BigInt.fromI32(1))
  accountMonth.transactionsCount = accountMonth.transactionsCount.plus(BigInt.fromI32(1))
}

function updateAccountStatistics (account: Account): void {
  if (account.purchasesCount.equals(BigInt.fromI32(1))) {
    Statistics.increaseAccountsWithPurchasesCount()
  } else if (account.salesCount.equals(BigInt.fromI32(1))) {
    Statistics.increaseAccountsWithSalesCount()
  } else if (account.swapsCount.equals(BigInt.fromI32(1))) {
    Statistics.increaseAccountsWithSwapsCount()
  }
}

function updateRelatedTokens (txId: string, offerTokenQuantity: BigInt, buyerTokenQuantity: BigInt, event: OfferAcceptedEvent): void  {
  const offerToken = getToken(event.params.offerToken)
  const buyerToken = getToken(event.params.buyerToken)

  // Offer Token
  updateTokenTransaction(offerToken, txId)
  updateTokenHistory(offerToken, offerTokenQuantity, event.block.timestamp)
  updateTokenVolume(offerToken, buyerToken, offerTokenQuantity, buyerTokenQuantity, event.block.timestamp)

  // Buyer Token
  updateTokenTransaction(buyerToken, txId)
  updateTokenHistory(buyerToken, buyerTokenQuantity, event.block.timestamp)
  updateTokenVolume(buyerToken, offerToken, buyerTokenQuantity, offerTokenQuantity, event.block.timestamp)

  offerToken.save()
  buyerToken.save()
}

function updateTokenTransaction (token: Token, txId: string): void {
  const tokenTransactions = token.transactions
  tokenTransactions.push(txId)
  token.transactions = tokenTransactions
  token.transactionsCount = BigInt.fromI32(tokenTransactions.length)
}

function updateTokenVolume (token: Token, childToken: Token, quantity: BigInt, childQuantity: BigInt, timestamp: BigInt): void {
  token.volume = token.volume.plus(quantity)

  const tokenVolume = getTokenVolume(token, childToken, quantity, childQuantity)
  tokenVolume.quantity = tokenVolume.quantity.plus(quantity)
  tokenVolume.volume = tokenVolume.volume.plus(childQuantity)
  
  updateTokenVolumeHistory(tokenVolume, quantity, childQuantity, timestamp)

  tokenVolume.save()
}

function getTokenVolume (token: Token, childToken: Token, quantity: BigInt, childQuantity: BigInt): TokenVolume {
  let tokenVolume = TokenVolume.load(token.id + '-' + childToken.id)
  if (tokenVolume == null) {
    tokenVolume = new TokenVolume(token.id + '-' + childToken.id)
    tokenVolume.parentToken = token.id
    tokenVolume.token = childToken.id
    tokenVolume.quantity = BigInt.fromI32(0)
    tokenVolume.volume = BigInt.fromI32(0)
    tokenVolume.volumeDaysCount = BigInt.fromI32(0)
    tokenVolume.volumeMonthsCount = BigInt.fromI32(0)

    token.volumesCount = token.volumesCount.plus(BigInt.fromI32(1))
  }

  return tokenVolume
}

function updateTokenVolumeHistory (tokenVolume: TokenVolume, quantity: BigInt, childQuantity: BigInt, timestamp: BigInt): void {
  updateTokenVolumeDay(tokenVolume, quantity, childQuantity, timestamp)
  updateTokenVolumeMonth(tokenVolume, quantity, childQuantity, timestamp)
}

function updateTokenVolumeDay (tokenVolume: TokenVolume, quantity: BigInt, childQuantity: BigInt, timestamp: BigInt): void {
  const date = getFullDay(timestamp)
  const tokenVolumeDayId = tokenVolume.id + '-' + date

  let tokenVolumeDay = TokenVolumeDay.load(tokenVolumeDayId)
  if (tokenVolumeDay == null) {
    tokenVolumeDay = new TokenVolumeDay(tokenVolumeDayId)
    tokenVolumeDay.parent = tokenVolume.id
    tokenVolumeDay.date = date
    tokenVolumeDay.year = getYear(timestamp)
    tokenVolumeDay.month = getMonth(timestamp)
    tokenVolumeDay.day = getDay(timestamp)
    tokenVolumeDay.quantity = BigInt.fromI32(0)
    tokenVolumeDay.volume = BigInt.fromI32(0)

    tokenVolume.volumeDaysCount = tokenVolume.volumeDaysCount.plus(BigInt.fromI32(1))
  }

  tokenVolumeDay.quantity = tokenVolumeDay.quantity.plus(quantity)
  tokenVolumeDay.volume = tokenVolumeDay.volume.plus(childQuantity)

  tokenVolumeDay.save()
}

function updateTokenVolumeMonth (tokenVolume: TokenVolume, quantity: BigInt, childQuantity: BigInt, timestamp: BigInt): void {
  const date = getFullMonth(timestamp)
  const tokenVolumeMonthId = tokenVolume.id + '-' + date

  let tokenVolumeMonth = TokenVolumeMonth.load(tokenVolumeMonthId)
  if (tokenVolumeMonth == null) {
    tokenVolumeMonth = new TokenVolumeMonth(tokenVolumeMonthId)
    tokenVolumeMonth.parent = tokenVolume.id
    tokenVolumeMonth.date = date
    tokenVolumeMonth.year = getYear(timestamp)
    tokenVolumeMonth.month = getMonth(timestamp)
    tokenVolumeMonth.quantity = BigInt.fromI32(0)
    tokenVolumeMonth.volume = BigInt.fromI32(0)

    tokenVolume.volumeMonthsCount = tokenVolume.volumeMonthsCount.plus(BigInt.fromI32(1))
  }
  tokenVolumeMonth.quantity = tokenVolumeMonth.quantity.plus(quantity)
  tokenVolumeMonth.volume = tokenVolumeMonth.volume.plus(childQuantity)

  tokenVolumeMonth.save()
}

function updateTokenHistory (token: Token, quantity: BigInt, timestamp: BigInt): void {
  const tokenDay = getTokenDay(token, timestamp)
  const tokenMonth = getTokenMonth(token, timestamp)

  tokenDay.transactionsCount = tokenDay.transactionsCount.plus(BigInt.fromI32(1))
  tokenDay.volume = tokenDay.volume.plus(quantity)
  tokenDay.save()

  tokenMonth.transactionsCount = tokenMonth.transactionsCount.plus(BigInt.fromI32(1))
  tokenMonth.volume = tokenMonth.volume.plus(quantity)
  tokenMonth.save()
}

function updateStatistics (offer: Offer, offerTokenQuantity: BigInt, buyerTokenQuantity: BigInt, wasActive: boolean): void {
  if (offer.transactionsCount.equals(BigInt.fromI32(1))) {
    Statistics.increaseOffersAcceptedCount()
  }

  if (wasActive && !offer.isActive) {
    Statistics.decreaseActiveOffersCount()
  }

  if (offer.type == 'REALTOKENTOERC20') {
    Statistics.increaseRealTokenTradeVolume(offerTokenQuantity)
  }

  if (offer.type == 'ERC20TOREALTOKEN') {
    Statistics.increaseRealTokenTradeVolume(buyerTokenQuantity)
  }
}
