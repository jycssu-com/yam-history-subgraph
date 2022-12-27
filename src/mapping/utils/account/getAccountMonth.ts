import { BigInt } from '@graphprotocol/graph-ts'
import { Account, AccountMonth } from '../../../types/schema'
import { getFullMonth, getMonth, getYear } from '../date'

export function getAccountMonth (account: Account, timestamp: BigInt): AccountMonth {
  const accountMonthId = account.id + '-' + getFullMonth(timestamp)

  let accountMonth = AccountMonth.load(accountMonthId)
  if (accountMonth == null) {
    accountMonth = new AccountMonth(accountMonthId)
    accountMonth.account = account.id
    accountMonth.year = getYear(timestamp)
    accountMonth.month = getMonth(timestamp)
    accountMonth.createdOffers = []
    accountMonth.createdOffersCount = BigInt.fromI32(0)
    accountMonth.updatedOffers = []
    accountMonth.updatedOffersCount = BigInt.fromI32(0)
    accountMonth.deletedOffers = []
    accountMonth.deletedOffersCount = BigInt.fromI32(0)
    accountMonth.purchases = []
    accountMonth.purchasesCount = BigInt.fromI32(0)
    accountMonth.sales = []
    accountMonth.salesCount = BigInt.fromI32(0)
    accountMonth.swaps = []
    accountMonth.swapsCount = BigInt.fromI32(0)
    accountMonth.transactions = []
    accountMonth.transactionsCount = BigInt.fromI32(0)
    accountMonth.save()

    const historyMonths = account.historyMonths
    historyMonths.push(accountMonthId)
    account.historyMonths = historyMonths
    account.historyMonthsCount = BigInt.fromI32(historyMonths.length)
    account.save()
  }
  return accountMonth
}
