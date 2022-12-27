import { Address, BigInt, ethereum } from '@graphprotocol/graph-ts'
import { OfferAccepted as OfferAcceptedEvent } from '../../types/RealTokenYam/RealTokenYam'
import { Offer, Transaction } from '../../types/schema'
import { createOfferQuantity, getAccount, getAccountMonth, getToken, getTokenDay, getTokenMonth } from '../utils'
import { isActiveOffer } from '../utils'
import { Statistics } from '../utils/statistics/Statistics'

function createTransaction (
  offer: Offer,
  takerAddress: Address,
  price: BigInt,
  quantity: BigInt,
  event: ethereum.Event
): Transaction {
  const transactionId = event.transaction.hash.toHex() + event.logIndex.toString()
  Statistics.increaseTransactionsCount()
  const transaction = new Transaction(transactionId)
  transaction.type = offer.type
  transaction.offer = offer.id
  transaction.taker = takerAddress.toHex()
  transaction.price = price
  transaction.quantity = quantity
  transaction.createdAtBlock = event.block.number
  transaction.createdAtTimestamp = event.block.timestamp
  transaction.save()

  return transaction
}

function saveOnOfferMaker (address: Address, transaction: Transaction, event: ethereum.Event): void {
  const offerMaker = getAccount(address)
  const offerMakerMonth = getAccountMonth(offerMaker, event.block.timestamp)

  if (transaction.type == 'REALTOKENTOERC20') {
    const offerMakerSales = offerMaker.sales
    offerMakerSales.push(transaction.id)
    offerMaker.sales = offerMakerSales
    offerMaker.salesCount = BigInt.fromI32(offerMakerSales.length)

    const offerMakerMonthSales = offerMakerMonth.sales
    offerMakerMonthSales.push(transaction.id)
    offerMakerMonth.sales = offerMakerMonthSales
    offerMakerMonth.salesCount = BigInt.fromI32(offerMakerMonthSales.length)
  } else if (transaction.type == 'ERC20TOREALTOKEN') {
    const offerMakerPurchase = offerMaker.purchases
    offerMakerPurchase.push(transaction.id)
    offerMaker.purchases = offerMakerPurchase
    offerMaker.purchasesCount = BigInt.fromI32(offerMakerPurchase.length)

    const offerMakerMonthPurchase = offerMakerMonth.purchases
    offerMakerMonthPurchase.push(transaction.id)
    offerMakerMonth.purchases = offerMakerMonthPurchase
    offerMakerMonth.purchasesCount = BigInt.fromI32(offerMakerMonthPurchase.length)
  } else {
    const offerMakerSwaps = offerMaker.swaps
    offerMakerSwaps.push(transaction.id)
    offerMaker.swaps = offerMakerSwaps
    offerMaker.swapsCount = BigInt.fromI32(offerMakerSwaps.length)

    const offerMakerMonthSwaps = offerMakerMonth.swaps
    offerMakerMonthSwaps.push(transaction.id)
    offerMakerMonth.swaps = offerMakerMonthSwaps
    offerMakerMonth.swapsCount = BigInt.fromI32(offerMakerMonthSwaps.length)
  }

  const offerMakerTransactions = offerMaker.transactions
  offerMakerTransactions.push(transaction.id)
  offerMaker.transactions = offerMakerTransactions
  offerMaker.transactionsCount = BigInt.fromI32(offerMakerTransactions.length)

  const offerMakerMonthTransactions = offerMakerMonth.transactions
  offerMakerMonthTransactions.push(transaction.id)
  offerMakerMonth.transactions = offerMakerMonthTransactions
  offerMakerMonth.transactionsCount = BigInt.fromI32(offerMakerMonthTransactions.length)

  offerMaker.save()
  offerMakerMonth.save()

  if (offerMaker.salesCount.equals(BigInt.fromI32(1))) {
    Statistics.increaseAccountsWithSalesCount()
  } else if (offerMaker.purchasesCount.equals(BigInt.fromI32(1))) {
    Statistics.increaseAccountsWithPurchasesCount()
  } else if (offerMaker.swapsCount.equals(BigInt.fromI32(1))) {
    Statistics.increaseAccountsWithSwapsCount()
  }
}

function saveOnOfferTaker (address: Address, transaction: Transaction, event: ethereum.Event): void {
  const offerTaker = getAccount(address)
  const offerTakerMonth = getAccountMonth(offerTaker, event.block.timestamp)

  if (transaction.type == 'REALTOKENTOERC20') {
    const offerTakerPurchase = offerTaker.purchases
    offerTakerPurchase.push(transaction.id)
    offerTaker.purchases = offerTakerPurchase
    offerTaker.purchasesCount = BigInt.fromI32(offerTakerPurchase.length)

    const offerTakerMonthPurchase = offerTakerMonth.purchases
    offerTakerMonthPurchase.push(transaction.id)
    offerTakerMonth.purchases = offerTakerMonthPurchase
    offerTakerMonth.purchasesCount = BigInt.fromI32(offerTakerMonthPurchase.length)
  } else if (transaction.type == 'ERC20TOREALTOKEN') {
    const offerTakerSales = offerTaker.sales
    offerTakerSales.push(transaction.id)
    offerTaker.sales = offerTakerSales
    offerTaker.salesCount = BigInt.fromI32(offerTakerSales.length)

    const offerTakerMonthSales = offerTakerMonth.sales
    offerTakerMonthSales.push(transaction.id)
    offerTakerMonth.sales = offerTakerMonthSales
    offerTakerMonth.salesCount = BigInt.fromI32(offerTakerMonthSales.length)
  } else {
    const offerTakerSwaps = offerTaker.swaps
    offerTakerSwaps.push(transaction.id)
    offerTaker.swaps = offerTakerSwaps
    offerTaker.swapsCount = BigInt.fromI32(offerTakerSwaps.length)

    const offerTakerMonthSwaps = offerTakerMonth.swaps
    offerTakerMonthSwaps.push(transaction.id)
    offerTakerMonth.swaps = offerTakerMonthSwaps
    offerTakerMonth.swapsCount = BigInt.fromI32(offerTakerMonthSwaps.length)
  }

  const offerTakerTransactions = offerTaker.transactions
  offerTakerTransactions.push(transaction.id)
  offerTaker.transactions = offerTakerTransactions
  offerTaker.transactionsCount = BigInt.fromI32(offerTakerTransactions.length)
  offerTaker.save()

  const offerTakerMonthTransactions = offerTakerMonth.transactions
  offerTakerMonthTransactions.push(transaction.id)
  offerTakerMonth.transactions = offerTakerMonthTransactions
  offerTakerMonth.transactionsCount = BigInt.fromI32(offerTakerMonthTransactions.length)
  offerTakerMonth.save()

  if (offerTaker.purchasesCount.equals(BigInt.fromI32(1))) {
    Statistics.increaseAccountsWithPurchasesCount()
  } else if (offerTaker.salesCount.equals(BigInt.fromI32(1))) {
    Statistics.increaseAccountsWithSalesCount()
  } else if (offerTaker.swapsCount.equals(BigInt.fromI32(1))) {
    Statistics.increaseAccountsWithSwapsCount()
  }
}

function saveOnToken (address: Address, transactionId: string, quantity: BigInt, event: ethereum.Event): void {
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
}

function getBuyerTokenQuantity (offerTokenAddress: Address, quantity: BigInt, price: BigInt): BigInt {
  const offerToken = getToken(offerTokenAddress)
  return quantity
    .div(BigInt.fromI64(<i64>Math.pow(10, offerToken.decimals.toU32())))
    .times(price)
}

export function handleOfferAccepted(event: OfferAcceptedEvent): void {
  const offerId = event.params.offerId.toString()
  const offer = Offer.load(offerId)

  if (offer) {
    const newAmount = offer.quantity.minus(event.params.amount)
    const offerQuantity = createOfferQuantity(offer.id, newAmount, 'OfferAccepted', event)
    const quantities = offer.quantities
    quantities.push(offerQuantity.id)
    offer.quantity = offerQuantity.quantity
    offer.quantities = quantities
    offer.quantitiesCount = BigInt.fromI32(quantities.length)

    const transaction = createTransaction(offer, event.params.buyer, event.params.price, event.params.amount, event)
    const offerTransactions = offer.transactions
    offerTransactions.push(transaction.id)
    offer.transactions = offerTransactions
    offer.transactionsCount = BigInt.fromI32(offerTransactions.length)

    offer.isActive = isActiveOffer(offer)
    offer.save()

    const buyerTokenQuantity = getBuyerTokenQuantity(event.params.offerToken, event.params.amount, event.params.price)

    saveOnOfferMaker(event.params.seller, transaction, event)
    saveOnOfferTaker(event.params.buyer, transaction, event)
    saveOnToken(event.params.offerToken, transaction.id, event.params.amount, event)
    saveOnToken(event.params.buyerToken, transaction.id, buyerTokenQuantity, event)

    if (offer.transactionsCount.equals(BigInt.fromI32(1))) {
      Statistics.increaseOffersAcceptedCount()
    }

    if (!offer.isActive) {
      Statistics.decreaseActiveOffersCount()
    }
  }
}
