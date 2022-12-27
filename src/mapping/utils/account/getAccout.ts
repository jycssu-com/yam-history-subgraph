import { Address, BigInt } from '@graphprotocol/graph-ts'
import { Account } from '../../../types/schema'
import { Statistics } from '../statistics/Statistics'

export function getAccount (address: Address): Account {
  let account = Account.load(address.toHex())
  if (account == null) {
    Statistics.increaseAccountsCount()
    account = new Account(address.toHex())
    account.address = address
    account.offers = []
    account.offersCount = BigInt.fromI32(0)
    account.purchases = []
    account.purchasesCount = BigInt.fromI32(0)
    account.sales = []
    account.salesCount = BigInt.fromI32(0)
    account.swaps = []
    account.swapsCount = BigInt.fromI32(0)
    account.transactions = []
    account.transactionsCount = BigInt.fromI32(0)
    account.historyMonths = []
    account.historyMonthsCount = BigInt.fromI32(0)
    account.save()
  }
  return account
}
