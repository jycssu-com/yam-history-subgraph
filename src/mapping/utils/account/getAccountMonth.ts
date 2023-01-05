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
    accountMonth.createdOffersCount = BigInt.fromI32(0)
    accountMonth.updatedOffersCount = BigInt.fromI32(0)
    accountMonth.deletedOffersCount = BigInt.fromI32(0)
    accountMonth.purchasesCount = BigInt.fromI32(0)
    accountMonth.salesCount = BigInt.fromI32(0)
    accountMonth.swapsCount = BigInt.fromI32(0)
    accountMonth.transactionsCount = BigInt.fromI32(0)
    accountMonth.save()

    account.historyMonthsCount = account.historyMonthsCount.plus(BigInt.fromI32(1))
    account.save()
  }
  return accountMonth
}
