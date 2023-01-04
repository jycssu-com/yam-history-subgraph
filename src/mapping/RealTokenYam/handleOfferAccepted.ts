import { Address, BigInt, ethereum } from '@graphprotocol/graph-ts'
import { OfferAccepted as OfferAcceptedEvent } from '../../types/RealTokenYam/RealTokenYam'
import { Account, AccountMonth, Offer, OfferQuantity, Token, Transaction } from '../../types/schema'
import { createOfferQuantity, getAccount, getAccountMonth, getToken, getTokenDay, getTokenMonth } from '../utils'
import { isActiveOffer } from '../utils'
import { Statistics } from '../utils/statistics/Statistics'

export function handleOfferAccepted(event: OfferAcceptedEvent): void {
  const offerId = event.params.offerId.toString()
  const offer = Offer.load(offerId)

  if (offer) {
    updateOfferQuantity(offer, event)
    const transaction = createOfferTransaction(offer, event)

    offer.isActive = isActiveOffer(offer)
    offer.save()

    const offerTokenQuantity = event.params.amount
    const buyerTokenQuantity = getBuyerTokenQuantity(event.params.offerToken, event.params.amount, event.params.price)

    updateRelatedMakerAccount(event.params.seller, transaction, event)
    updateRelatedTakerAccount(event.params.buyer, transaction, event)
    updateRelatedToken(event.params.offerToken, transaction.id, offerTokenQuantity, event)
    updateRelatedToken(event.params.buyerToken, transaction.id, buyerTokenQuantity, event)
    updateStatistics(offer, offerTokenQuantity, buyerTokenQuantity)
  }
}

function updateOfferQuantity (offer: Offer, event: OfferAcceptedEvent): OfferQuantity {
  const newQuantity = offer.quantity.minus(event.params.amount)
  const offerQuantity = createOfferQuantity(offer.id, newQuantity, 'OfferAccepted', event)
  const quantities = offer.quantities
  quantities.push(offerQuantity.id)
  offer.quantity = offerQuantity.quantity
  offer.quantities = quantities
  offer.quantitiesCount = BigInt.fromI32(quantities.length)
  return offerQuantity
}

function createOfferTransaction (offer: Offer, event: OfferAcceptedEvent): Transaction {
  const transaction = createTransaction(offer, event)
  const offerTransactions = offer.transactions
  offerTransactions.push(transaction.id)
  offer.transactions = offerTransactions
  offer.transactionsCount = BigInt.fromI32(offerTransactions.length)
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
    .div(BigInt.fromI64(<i64>Math.pow(10, offerToken.decimals.toU32())))
    .times(price)
}

function updateRelatedMakerAccount (address: Address, transaction: Transaction, event: ethereum.Event): void {
  const offerMaker = getAccount(address)
  const offerMakerMonth = getAccountMonth(offerMaker, event.block.timestamp)

  if (transaction.type == 'REALTOKENTOERC20') {
    addSaleOnAccount(transaction.id, offerMaker, offerMakerMonth)
  } else if (transaction.type == 'ERC20TOREALTOKEN') {
    addPurchaseOnAccount(transaction.id, offerMaker, offerMakerMonth)
  } else {
    addSwapOnAccount(transaction.id, offerMaker, offerMakerMonth)
  }

  addTransactionOnAccount(transaction.id, offerMaker, offerMakerMonth)
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
  account.purchasesCount = BigInt.fromI32(accountPurchase.length)

  const accountMonthPurchase = accountMonth.purchases
  accountMonthPurchase.push(transactionId)
  accountMonth.purchases = accountMonthPurchase
  accountMonth.purchasesCount = BigInt.fromI32(accountMonthPurchase.length)
}

function addSaleOnAccount (transactionId: string, account: Account, accountMonth: AccountMonth): void {
  const accountSales = account.sales
  accountSales.push(transactionId)
  account.sales = accountSales
  account.salesCount = BigInt.fromI32(accountSales.length)

  const accountMonthSales = accountMonth.sales
  accountMonthSales.push(transactionId)
  accountMonth.sales = accountMonthSales
  accountMonth.salesCount = BigInt.fromI32(accountMonthSales.length)
}

function addSwapOnAccount (transactionId: string, account: Account, accountMonth: AccountMonth): void {
  const accountSwaps = account.swaps
  accountSwaps.push(transactionId)
  account.swaps = accountSwaps
  account.swapsCount = BigInt.fromI32(accountSwaps.length)

  const accountMonthSwaps = accountMonth.swaps
  accountMonthSwaps.push(transactionId)
  accountMonth.swaps = accountMonthSwaps
  accountMonth.swapsCount = BigInt.fromI32(accountMonthSwaps.length)
}

function addTransactionOnAccount (transactionId: string, account: Account, accountMonth: AccountMonth): void {
  const accountTransactions = account.transactions
  accountTransactions.push(transactionId)
  account.transactions = accountTransactions
  account.transactionsCount = BigInt.fromI32(accountTransactions.length)

  const accountMonthTransactions = accountMonth.transactions
  accountMonthTransactions.push(transactionId)
  accountMonth.transactions = accountMonthTransactions
  accountMonth.transactionsCount = BigInt.fromI32(accountMonthTransactions.length)
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

function updateRelatedToken (address: Address, transactionId: string, quantity: BigInt, event: ethereum.Event): Token {
  const token = getToken(address)
  const tokenDay = getTokenDay(token, event.block.timestamp)
  const tokenMonth = getTokenMonth(token, event.block.timestamp)

  const tokenTransactions = token.transactions
  tokenTransactions.push(transactionId)
  token.transactions = tokenTransactions
  token.transactionsCount = BigInt.fromI32(tokenTransactions.length)
  token.volume = token.volume.plus(quantity)
  token.save()

  const tokenDayTransactions = tokenDay.transactions
  tokenDayTransactions.push(transactionId)
  tokenDay.transactions = tokenDayTransactions
  tokenDay.transactionsCount = BigInt.fromI32(tokenDayTransactions.length)
  tokenDay.volume = tokenDay.volume.plus(quantity)
  tokenDay.save()

  const tokenMonthTransactions = tokenMonth.transactions
  tokenMonthTransactions.push(transactionId)
  tokenMonth.transactions = tokenMonthTransactions
  tokenMonth.transactionsCount = BigInt.fromI32(tokenMonthTransactions.length)
  tokenMonth.volume = tokenMonth.volume.plus(quantity)
  tokenMonth.save()

  return token
}

function updateStatistics (offer: Offer, offerTokenQuantity: BigInt, buyerTokenQuantity: BigInt): void {
  if (offer.transactionsCount.equals(BigInt.fromI32(1))) {
    Statistics.increaseOffersAcceptedCount()
  }

  if (!offer.isActive) {
    Statistics.decreaseActiveOffersCount()
  }

  if (offer.type == 'REALTOKENTOERC20') {
    Statistics.increaseRealTokenTradeVolume(offerTokenQuantity)
  }

  if (offer.type == 'ERC20TOREALTOKEN') {
    Statistics.increaseRealTokenTradeVolume(buyerTokenQuantity)
  }
}
