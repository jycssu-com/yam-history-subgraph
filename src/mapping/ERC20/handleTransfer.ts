import { Transfer as TransferEvent } from '../../types/RealTokenYam/ERC20'
import { AccountBalance, Account, Offer } from '../../types/schema'
import { computeOfferFields } from '../utils'
import { Statistics } from '../utils/statistics/Statistics'

export function handleTransfer (event: TransferEvent): void {
  const tokenId = event.address.toHex()
  const fromAccountBalance = AccountBalance.load(event.params.from.toHex() + '-' + tokenId)
  const toAccountBalance = AccountBalance.load(event.params.to.toHex() + '-' + tokenId)

  if (fromAccountBalance) {
    fromAccountBalance.balance = fromAccountBalance.balance.minus(event.params.value)
    fromAccountBalance.save()

    const account = Account.load(fromAccountBalance.account)
    if (account) {
      // TODO: Account.offers should be a derivedFrom field, but it's seems not possible to get it
      for (let i = 0; i < account.offers.length; i++) {
        const offer = Offer.load(account.offers[i])
        if (offer) {
          if (offer.offerToken == tokenId) {
            const wasActive = offer.isActive
            computeOfferFields(offer)
            offer.save()

            if (wasActive && !offer.isActive) {
              Statistics.decreaseActiveOffersCount()
            }
          }
        }
      }
    }
  }

  if (toAccountBalance) {
    toAccountBalance.balance = toAccountBalance.balance.plus(event.params.value)
    toAccountBalance.save()

    const account = Account.load(toAccountBalance.account)
    if (account) {
      // TODO: Account.offers should be a derivedFrom field, but it's seems not possible to get it
      for (let i = 0; i < account.offers.length; i++) {
        const offer = Offer.load(account.offers[i])
        if (offer) {
          if (offer.offerToken == tokenId) {
            const wasActive = offer.isActive
            computeOfferFields(offer)
            offer.save()

            if (!wasActive && offer.isActive) {
              Statistics.increaseActiveOffersCount()
            }
          }
        }
      }
    }
  }
}
