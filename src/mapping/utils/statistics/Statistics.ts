import { BigInt } from '@graphprotocol/graph-ts'
import { StatisticDay, CumulativeStatisticDay, StatisticMonth, CumulativeStatisticMonth } from '../../../types/schema'
import { getDay, getFullDay, getMonth, getYear } from '../date'

const TIMESTAMP_DAY = 86400
const TIMESTAMP_MONTH = 2592000

export class Statistics {
  static _statisticsDay: StatisticDay | null = null;
  static _cumulativeStatisticsDay: CumulativeStatisticDay | null = null;
  static _statisticsMonth: StatisticMonth | null = null;
  static _cumulativeStatisticsMonth: CumulativeStatisticMonth | null = null;

  private static initializeStatisticsDay (timestamp: BigInt): void {
    const statisticsDayId = getFullDay(timestamp)
    let statisticsDay = StatisticDay.load(statisticsDayId)

    if (statisticsDay == null) {
      statisticsDay = new StatisticDay(statisticsDayId)
      statisticsDay.year = getYear(timestamp)
      statisticsDay.month = getMonth(timestamp)
      statisticsDay.day = getDay(timestamp)

      statisticsDay.offersCreatedCount = BigInt.fromI32(0)
      statisticsDay.transactionsCount = BigInt.fromI32(0)
      statisticsDay.tokensCount = BigInt.fromI32(0)
      statisticsDay.accountsCount = BigInt.fromI32(0)
      statisticsDay.offersWithPriceChangesCount = BigInt.fromI32(0)
      statisticsDay.offersDeletedCount = BigInt.fromI32(0)
      statisticsDay.offersAcceptedCount = BigInt.fromI32(0)
      statisticsDay.offersPrivateCount = BigInt.fromI32(0)
      statisticsDay.offersActiveCount = BigInt.fromI32(0)
      statisticsDay.accountsWithOffersCount = BigInt.fromI32(0)
      statisticsDay.accountsWithSalesCount = BigInt.fromI32(0)
      statisticsDay.accountsWithPurchasesCount = BigInt.fromI32(0)
      statisticsDay.accountsWithSwapsCount = BigInt.fromI32(0)
      statisticsDay.realTokenTradeVolume = BigInt.fromI32(0)
      statisticsDay.save()
    }
    Statistics._statisticsDay = statisticsDay
  }

  private static initializeCumulativeStatisticsDay (timestamp: BigInt): void {
    const cumulativeStatisticsDayId = getFullDay(timestamp)
    let cumulativeStatisticsDay = CumulativeStatisticDay.load(cumulativeStatisticsDayId)

    if (cumulativeStatisticsDay == null) {
      const previousId = getFullDay(timestamp.minus(BigInt.fromI32(TIMESTAMP_DAY)))
      const previous = CumulativeStatisticDay.load(previousId)

      cumulativeStatisticsDay = new CumulativeStatisticDay(cumulativeStatisticsDayId)
      cumulativeStatisticsDay.year = getYear(timestamp)
      cumulativeStatisticsDay.month = getMonth(timestamp)
      cumulativeStatisticsDay.day = getDay(timestamp)

      cumulativeStatisticsDay.offersCreatedCount = previous == null ? BigInt.fromI32(0) : previous.offersCreatedCount
      cumulativeStatisticsDay.transactionsCount = previous == null ? BigInt.fromI32(0) : previous.transactionsCount
      cumulativeStatisticsDay.tokensCount = previous == null ? BigInt.fromI32(0) : previous.tokensCount
      cumulativeStatisticsDay.accountsCount = previous == null ? BigInt.fromI32(0) : previous.accountsCount
      cumulativeStatisticsDay.offersWithPriceChangesCount = previous == null ? BigInt.fromI32(0) : previous.offersWithPriceChangesCount
      cumulativeStatisticsDay.offersDeletedCount = previous == null ? BigInt.fromI32(0) : previous.offersDeletedCount
      cumulativeStatisticsDay.offersAcceptedCount = previous == null ? BigInt.fromI32(0) : previous.offersAcceptedCount
      cumulativeStatisticsDay.offersPrivateCount = previous == null ? BigInt.fromI32(0) : previous.offersPrivateCount
      cumulativeStatisticsDay.offersActiveCount = previous == null ? BigInt.fromI32(0) : previous.offersActiveCount
      cumulativeStatisticsDay.accountsWithOffersCount = previous == null ? BigInt.fromI32(0) : previous.accountsWithOffersCount
      cumulativeStatisticsDay.accountsWithSalesCount = previous == null ? BigInt.fromI32(0) : previous.accountsWithSalesCount
      cumulativeStatisticsDay.accountsWithPurchasesCount = previous == null ? BigInt.fromI32(0) : previous.accountsWithPurchasesCount
      cumulativeStatisticsDay.accountsWithSwapsCount = previous == null ? BigInt.fromI32(0) : previous.accountsWithSwapsCount
      cumulativeStatisticsDay.realTokenTradeVolume = previous == null ? BigInt.fromI32(0) : previous.realTokenTradeVolume
      cumulativeStatisticsDay.save()
    }
    Statistics._cumulativeStatisticsDay = cumulativeStatisticsDay
  }

  private static initializeStatisticsMonth (timestamp: BigInt): void {
    const statisticsMonthId = getFullDay(timestamp)
    let statisticsMonth = StatisticMonth.load(statisticsMonthId)

    if (statisticsMonth == null) {
      statisticsMonth = new StatisticMonth(statisticsMonthId)
      statisticsMonth.year = getYear(timestamp)
      statisticsMonth.month = getMonth(timestamp)

      statisticsMonth.offersCreatedCount = BigInt.fromI32(0)
      statisticsMonth.transactionsCount = BigInt.fromI32(0)
      statisticsMonth.tokensCount = BigInt.fromI32(0)
      statisticsMonth.accountsCount = BigInt.fromI32(0)
      statisticsMonth.offersWithPriceChangesCount = BigInt.fromI32(0)
      statisticsMonth.offersDeletedCount = BigInt.fromI32(0)
      statisticsMonth.offersAcceptedCount = BigInt.fromI32(0)
      statisticsMonth.offersPrivateCount = BigInt.fromI32(0)
      statisticsMonth.offersActiveCount = BigInt.fromI32(0)
      statisticsMonth.accountsWithOffersCount = BigInt.fromI32(0)
      statisticsMonth.accountsWithSalesCount = BigInt.fromI32(0)
      statisticsMonth.accountsWithPurchasesCount = BigInt.fromI32(0)
      statisticsMonth.accountsWithSwapsCount = BigInt.fromI32(0)
      statisticsMonth.realTokenTradeVolume = BigInt.fromI32(0)
      statisticsMonth.save()
    }
    Statistics._statisticsMonth = statisticsMonth
  }

  private static initializeCumulativeStatisticsMonth (timestamp: BigInt): void {
    const cumulativeStatisticsMonthId = getFullDay(timestamp)
    let cumulativeStatisticsMonth = CumulativeStatisticMonth.load(cumulativeStatisticsMonthId)

    if (cumulativeStatisticsMonth == null) {
      const previousId = getFullDay(timestamp.minus(BigInt.fromI32(TIMESTAMP_DAY)))
      const previous = CumulativeStatisticMonth.load(previousId)

      cumulativeStatisticsMonth = new CumulativeStatisticMonth(cumulativeStatisticsMonthId)
      cumulativeStatisticsMonth.year = getYear(timestamp)
      cumulativeStatisticsMonth.month = getMonth(timestamp)

      cumulativeStatisticsMonth.offersCreatedCount = previous == null ? BigInt.fromI32(0) : previous.offersCreatedCount
      cumulativeStatisticsMonth.transactionsCount = previous == null ? BigInt.fromI32(0) : previous.transactionsCount
      cumulativeStatisticsMonth.tokensCount = previous == null ? BigInt.fromI32(0) : previous.tokensCount
      cumulativeStatisticsMonth.accountsCount = previous == null ? BigInt.fromI32(0) : previous.accountsCount
      cumulativeStatisticsMonth.offersWithPriceChangesCount = previous == null ? BigInt.fromI32(0) : previous.offersWithPriceChangesCount
      cumulativeStatisticsMonth.offersDeletedCount = previous == null ? BigInt.fromI32(0) : previous.offersDeletedCount
      cumulativeStatisticsMonth.offersAcceptedCount = previous == null ? BigInt.fromI32(0) : previous.offersAcceptedCount
      cumulativeStatisticsMonth.offersPrivateCount = previous == null ? BigInt.fromI32(0) : previous.offersPrivateCount
      cumulativeStatisticsMonth.offersActiveCount = previous == null ? BigInt.fromI32(0) : previous.offersActiveCount
      cumulativeStatisticsMonth.accountsWithOffersCount = previous == null ? BigInt.fromI32(0) : previous.accountsWithOffersCount
      cumulativeStatisticsMonth.accountsWithSalesCount = previous == null ? BigInt.fromI32(0) : previous.accountsWithSalesCount
      cumulativeStatisticsMonth.accountsWithPurchasesCount = previous == null ? BigInt.fromI32(0) : previous.accountsWithPurchasesCount
      cumulativeStatisticsMonth.accountsWithSwapsCount = previous == null ? BigInt.fromI32(0) : previous.accountsWithSwapsCount
      cumulativeStatisticsMonth.realTokenTradeVolume = previous == null ? BigInt.fromI32(0) : previous.realTokenTradeVolume
      cumulativeStatisticsMonth.save()
    }
    Statistics._cumulativeStatisticsMonth = cumulativeStatisticsMonth
  }

  private static get statisticsDay (): StatisticDay {
    return Statistics._statisticsDay as StatisticDay
  }

  private static get cumulativeStatisticsDay (): CumulativeStatisticDay {
    return Statistics._cumulativeStatisticsDay as CumulativeStatisticDay
  }

  private static get statisticsMonth (): StatisticMonth {
    return Statistics._statisticsMonth as StatisticMonth
  }

  private static get cumulativeStatisticsMonth (): CumulativeStatisticMonth {
    return Statistics._cumulativeStatisticsMonth as CumulativeStatisticMonth
  }

  public static initialize (timestamp: BigInt): void {
    this.initializeStatisticsDay(timestamp)
    this.initializeCumulativeStatisticsDay(timestamp)
    this.initializeStatisticsMonth(timestamp)
    this.initializeCumulativeStatisticsMonth(timestamp)
  }

  static increaseOffersCount (): void {
    Statistics.statisticsDay.offersCreatedCount = Statistics.statisticsDay.offersCreatedCount.plus(BigInt.fromI32(1))
    Statistics.cumulativeStatisticsDay.offersCreatedCount = Statistics.cumulativeStatisticsDay.offersCreatedCount.plus(BigInt.fromI32(1))
    Statistics.statisticsMonth.offersCreatedCount = Statistics.statisticsMonth.offersCreatedCount.plus(BigInt.fromI32(1))
    Statistics.cumulativeStatisticsMonth.offersCreatedCount = Statistics.cumulativeStatisticsMonth.offersCreatedCount.plus(BigInt.fromI32(1))
    Statistics.save()
  }

  static increaseTransactionsCount (): void {
    Statistics.statisticsDay.transactionsCount = Statistics.statisticsDay.transactionsCount.plus(BigInt.fromI32(1))
    Statistics.cumulativeStatisticsDay.transactionsCount = Statistics.cumulativeStatisticsDay.transactionsCount.plus(BigInt.fromI32(1))
    Statistics.statisticsMonth.transactionsCount = Statistics.statisticsMonth.transactionsCount.plus(BigInt.fromI32(1))
    Statistics.cumulativeStatisticsMonth.transactionsCount = Statistics.cumulativeStatisticsMonth.transactionsCount.plus(BigInt.fromI32(1))
    Statistics.save()
  }

  static increaseTokensCount (): void {
    Statistics.statisticsDay.tokensCount = Statistics.statisticsDay.tokensCount.plus(BigInt.fromI32(1))
    Statistics.cumulativeStatisticsDay.tokensCount = Statistics.cumulativeStatisticsDay.tokensCount.plus(BigInt.fromI32(1))
    Statistics.statisticsMonth.tokensCount = Statistics.statisticsMonth.tokensCount.plus(BigInt.fromI32(1))
    Statistics.cumulativeStatisticsMonth.tokensCount = Statistics.cumulativeStatisticsMonth.tokensCount.plus(BigInt.fromI32(1))
    Statistics.save()
  }

  static increaseAccountsCount (): void {
    Statistics.statisticsDay.accountsCount = Statistics.statisticsDay.accountsCount.plus(BigInt.fromI32(1))
    Statistics.cumulativeStatisticsDay.accountsCount = Statistics.cumulativeStatisticsDay.accountsCount.plus(BigInt.fromI32(1))
    Statistics.statisticsMonth.accountsCount = Statistics.statisticsMonth.accountsCount.plus(BigInt.fromI32(1))
    Statistics.cumulativeStatisticsMonth.accountsCount = Statistics.cumulativeStatisticsMonth.accountsCount.plus(BigInt.fromI32(1))
    Statistics.save()
  }

  static increaseOffersWithPriceChangesCount (): void {
    Statistics.statisticsDay.offersWithPriceChangesCount = Statistics.statisticsDay.offersWithPriceChangesCount.plus(BigInt.fromI32(1))
    Statistics.cumulativeStatisticsDay.offersWithPriceChangesCount = Statistics.cumulativeStatisticsDay.offersWithPriceChangesCount.plus(BigInt.fromI32(1))
    Statistics.statisticsMonth.offersWithPriceChangesCount = Statistics.statisticsMonth.offersWithPriceChangesCount.plus(BigInt.fromI32(1))
    Statistics.cumulativeStatisticsMonth.offersWithPriceChangesCount = Statistics.cumulativeStatisticsMonth.offersWithPriceChangesCount.plus(BigInt.fromI32(1))
    Statistics.save()
  }

  static increaseOffersDeletedCount (): void {
    Statistics.statisticsDay.offersDeletedCount = Statistics.statisticsDay.offersDeletedCount.plus(BigInt.fromI32(1))
    Statistics.cumulativeStatisticsDay.offersDeletedCount = Statistics.cumulativeStatisticsDay.offersDeletedCount.plus(BigInt.fromI32(1))
    Statistics.statisticsMonth.offersDeletedCount = Statistics.statisticsMonth.offersDeletedCount.plus(BigInt.fromI32(1))
    Statistics.cumulativeStatisticsMonth.offersDeletedCount = Statistics.cumulativeStatisticsMonth.offersDeletedCount.plus(BigInt.fromI32(1))
    Statistics.save()
  }

  static increaseOffersAcceptedCount (): void {
    Statistics.statisticsDay.offersAcceptedCount = Statistics.statisticsDay.offersAcceptedCount.plus(BigInt.fromI32(1))
    Statistics.cumulativeStatisticsDay.offersAcceptedCount = Statistics.cumulativeStatisticsDay.offersAcceptedCount.plus(BigInt.fromI32(1))
    Statistics.statisticsMonth.offersAcceptedCount = Statistics.statisticsMonth.offersAcceptedCount.plus(BigInt.fromI32(1))
    Statistics.cumulativeStatisticsMonth.offersAcceptedCount = Statistics.cumulativeStatisticsMonth.offersAcceptedCount.plus(BigInt.fromI32(1))
    Statistics.save()
  }

  static increasePrivateOffersCount (): void {
    Statistics.statisticsDay.offersPrivateCount = Statistics.statisticsDay.offersPrivateCount.plus(BigInt.fromI32(1))
    Statistics.cumulativeStatisticsDay.offersPrivateCount = Statistics.cumulativeStatisticsDay.offersPrivateCount.plus(BigInt.fromI32(1))
    Statistics.statisticsMonth.offersPrivateCount = Statistics.statisticsMonth.offersPrivateCount.plus(BigInt.fromI32(1))
    Statistics.cumulativeStatisticsMonth.offersPrivateCount = Statistics.cumulativeStatisticsMonth.offersPrivateCount.plus(BigInt.fromI32(1))
    Statistics.save()
  }

  static increaseActiveOffersCount (): void {
    Statistics.statisticsDay.offersActiveCount = Statistics.statisticsDay.offersActiveCount.plus(BigInt.fromI32(1))
    Statistics.cumulativeStatisticsDay.offersActiveCount = Statistics.cumulativeStatisticsDay.offersActiveCount.plus(BigInt.fromI32(1))
    Statistics.statisticsMonth.offersActiveCount = Statistics.statisticsMonth.offersActiveCount.plus(BigInt.fromI32(1))
    Statistics.cumulativeStatisticsMonth.offersActiveCount = Statistics.cumulativeStatisticsMonth.offersActiveCount.plus(BigInt.fromI32(1))
    Statistics.save()
  }

  static decreaseActiveOffersCount (): void {
    Statistics.statisticsDay.offersActiveCount = Statistics.statisticsDay.offersActiveCount.minus(BigInt.fromI32(1))
    Statistics.cumulativeStatisticsDay.offersActiveCount = Statistics.cumulativeStatisticsDay.offersActiveCount.minus(BigInt.fromI32(1))
    Statistics.statisticsMonth.offersActiveCount = Statistics.statisticsMonth.offersActiveCount.minus(BigInt.fromI32(1))
    Statistics.cumulativeStatisticsMonth.offersActiveCount = Statistics.cumulativeStatisticsMonth.offersActiveCount.minus(BigInt.fromI32(1))
    Statistics.save()
  }

  static increaseAccountsWithOffersCount (): void {
    Statistics.statisticsDay.accountsWithOffersCount = Statistics.statisticsDay.accountsWithOffersCount.plus(BigInt.fromI32(1))
    Statistics.cumulativeStatisticsDay.accountsWithOffersCount = Statistics.cumulativeStatisticsDay.accountsWithOffersCount.plus(BigInt.fromI32(1))
    Statistics.statisticsMonth.accountsWithOffersCount = Statistics.statisticsMonth.accountsWithOffersCount.plus(BigInt.fromI32(1))
    Statistics.cumulativeStatisticsMonth.accountsWithOffersCount = Statistics.cumulativeStatisticsMonth.accountsWithOffersCount.plus(BigInt.fromI32(1))
    Statistics.save()
  }

  static increaseAccountsWithSalesCount (): void {
    Statistics.statisticsDay.accountsWithSalesCount = Statistics.statisticsDay.accountsWithSalesCount.plus(BigInt.fromI32(1))
    Statistics.cumulativeStatisticsDay.accountsWithSalesCount = Statistics.cumulativeStatisticsDay.accountsWithSalesCount.plus(BigInt.fromI32(1))
    Statistics.statisticsMonth.accountsWithSalesCount = Statistics.statisticsMonth.accountsWithSalesCount.plus(BigInt.fromI32(1))
    Statistics.cumulativeStatisticsMonth.accountsWithSalesCount = Statistics.cumulativeStatisticsMonth.accountsWithSalesCount.plus(BigInt.fromI32(1))
    Statistics.save()
  }

  static increaseAccountsWithPurchasesCount (): void {
    Statistics.statisticsDay.accountsWithPurchasesCount = Statistics.statisticsDay.accountsWithPurchasesCount.plus(BigInt.fromI32(1))
    Statistics.cumulativeStatisticsDay.accountsWithPurchasesCount = Statistics.cumulativeStatisticsDay.accountsWithPurchasesCount.plus(BigInt.fromI32(1))
    Statistics.statisticsMonth.accountsWithPurchasesCount = Statistics.statisticsMonth.accountsWithPurchasesCount.plus(BigInt.fromI32(1))
    Statistics.cumulativeStatisticsMonth.accountsWithPurchasesCount = Statistics.cumulativeStatisticsMonth.accountsWithPurchasesCount.plus(BigInt.fromI32(1))
    Statistics.save()
  }

  static increaseAccountsWithSwapsCount (): void {
    Statistics.statisticsDay.accountsWithSwapsCount = Statistics.statisticsDay.accountsWithSwapsCount.plus(BigInt.fromI32(1))
    Statistics.cumulativeStatisticsDay.accountsWithSwapsCount = Statistics.cumulativeStatisticsDay.accountsWithSwapsCount.plus(BigInt.fromI32(1))
    Statistics.statisticsMonth.accountsWithSwapsCount = Statistics.statisticsMonth.accountsWithSwapsCount.plus(BigInt.fromI32(1))
    Statistics.cumulativeStatisticsMonth.accountsWithSwapsCount = Statistics.cumulativeStatisticsMonth.accountsWithSwapsCount.plus(BigInt.fromI32(1))
    Statistics.save()
  }

  static increaseRealTokenTradeVolume (amount: BigInt): void {
    Statistics.statisticsDay.realTokenTradeVolume = Statistics.statisticsDay.realTokenTradeVolume.plus(amount)
    Statistics.cumulativeStatisticsDay.realTokenTradeVolume = Statistics.cumulativeStatisticsDay.realTokenTradeVolume.plus(amount)
    Statistics.statisticsMonth.realTokenTradeVolume = Statistics.statisticsMonth.realTokenTradeVolume.plus(amount)
    Statistics.cumulativeStatisticsMonth.realTokenTradeVolume = Statistics.cumulativeStatisticsMonth.realTokenTradeVolume.plus(amount)
    Statistics.save()
  }

  static save (): void {
    Statistics.statisticsDay.save()
    Statistics.cumulativeStatisticsDay.save()
    Statistics.statisticsMonth.save()
    Statistics.cumulativeStatisticsMonth.save()
  }
}
