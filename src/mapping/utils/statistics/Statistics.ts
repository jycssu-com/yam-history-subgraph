import { BigInt } from '@graphprotocol/graph-ts'
import { Statistic as StatisticSchema } from '../../../types/schema'

const STATISTIC_ID = 'STATISTICS'

export class Statistics {
  static statistics: StatisticSchema | null = null;

  private static initialize (): void {
    let statistics = StatisticSchema.load(STATISTIC_ID)
    if (statistics == null) {
      statistics = new StatisticSchema(STATISTIC_ID)
      statistics.offersCount = BigInt.fromI32(0)
      statistics.transactionsCount = BigInt.fromI32(0)
      statistics.tokensCount = BigInt.fromI32(0)
      statistics.accountsCount = BigInt.fromI32(0)
      statistics.offersWithPriceChangesCount = BigInt.fromI32(0)
      statistics.offersDeletedCount = BigInt.fromI32(0)
      statistics.offersAcceptedCount = BigInt.fromI32(0)
      statistics.privateOffersCount = BigInt.fromI32(0)
      statistics.activeOffersCount = BigInt.fromI32(0)
      statistics.accountsWithOffersCount = BigInt.fromI32(0)
      statistics.accountsWithSalesCount = BigInt.fromI32(0)
      statistics.accountsWithPurchasesCount = BigInt.fromI32(0)
      statistics.accountsWithSwapsCount = BigInt.fromI32(0)
      statistics.realTokenTradeVolume = BigInt.fromI32(0)
      statistics.save()
    }
    Statistics.statistics = statistics
  }

  private static getInstance (): StatisticSchema {
    if (Statistics.statistics == null) {
      Statistics.initialize()
    }
    return Statistics.statistics as StatisticSchema
  }

  static increaseOffersCount (): void {
    let statistics = Statistics.getInstance()
    statistics.offersCount = statistics.offersCount.plus(BigInt.fromI32(1))
    Statistics.save()
  }

  static increaseTransactionsCount (): void {
    let statistics = Statistics.getInstance()
    statistics.transactionsCount = statistics.transactionsCount.plus(BigInt.fromI32(1))
    Statistics.save()
  }

  static increaseTokensCount (): void {
    let statistics = Statistics.getInstance()
    statistics.tokensCount = statistics.tokensCount.plus(BigInt.fromI32(1))
    Statistics.save()
  }

  static increaseAccountsCount (): void {
    let statistics = Statistics.getInstance()
    statistics.accountsCount = statistics.accountsCount.plus(BigInt.fromI32(1))
    Statistics.save()
  }

  static increaseOffersWithPriceChangesCount (): void {
    let statistics = Statistics.getInstance()
    statistics.offersWithPriceChangesCount = statistics.offersWithPriceChangesCount.plus(BigInt.fromI32(1))
    Statistics.save()
  }

  static increaseOffersDeletedCount (): void {
    let statistics = Statistics.getInstance()
    statistics.offersDeletedCount = statistics.offersDeletedCount.plus(BigInt.fromI32(1))
    Statistics.save()
  }

  static increaseOffersAcceptedCount (): void {
    let statistics = Statistics.getInstance()
    statistics.offersAcceptedCount = statistics.offersAcceptedCount.plus(BigInt.fromI32(1))
    Statistics.save()
  }

  static increasePrivateOffersCount (): void {
    let statistics = Statistics.getInstance()
    statistics.privateOffersCount = statistics.privateOffersCount.plus(BigInt.fromI32(1))
    Statistics.save()
  }

  static increaseActiveOffersCount (): void {
    let statistics = Statistics.getInstance()
    statistics.activeOffersCount = statistics.activeOffersCount.plus(BigInt.fromI32(1))
    Statistics.save()
  }

  static decreaseActiveOffersCount (): void {
    let statistics = Statistics.getInstance()
    statistics.activeOffersCount = statistics.activeOffersCount.minus(BigInt.fromI32(1))
    Statistics.save()
  }

  static increaseAccountsWithOffersCount (): void {
    let statistics = Statistics.getInstance()
    statistics.accountsWithOffersCount = statistics.accountsWithOffersCount.plus(BigInt.fromI32(1))
    Statistics.save()
  }

  static increaseAccountsWithSalesCount (): void {
    let statistics = Statistics.getInstance()
    statistics.accountsWithSalesCount = statistics.accountsWithSalesCount.plus(BigInt.fromI32(1))
    Statistics.save()
  }

  static increaseAccountsWithPurchasesCount (): void {
    let statistics = Statistics.getInstance()
    statistics.accountsWithPurchasesCount = statistics.accountsWithPurchasesCount.plus(BigInt.fromI32(1))
    Statistics.save()
  }

  static increaseAccountsWithSwapsCount (): void {
    let statistics = Statistics.getInstance()
    statistics.accountsWithSwapsCount = statistics.accountsWithSwapsCount.plus(BigInt.fromI32(1))
    Statistics.save()
  }

  static increaseRealTokenTradeVolume (amount: BigInt): void {
    let statistics = Statistics.getInstance()
    statistics.realTokenTradeVolume = statistics.realTokenTradeVolume.plus(amount)
    Statistics.save()
  }

  static save (): void {
    let statistics = Statistics.getInstance()
    statistics.save()
  }
}
