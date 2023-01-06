import { Address } from '@graphprotocol/graph-ts'
import { Approval as ApprovalEvent } from '../../types/RealTokenYam/ERC20'
import { Account, AccountAllowance, Offer } from '../../types/schema'
import { computeOfferFields } from '../utils'
import { Statistics } from '../utils/statistics/Statistics'

export function handleApproval (event: ApprovalEvent): void {
  if (event.params.spender.equals(Address.fromString('0xc759aa7f9dd9720a1502c104dae4f9852bb17c14'))) {
    const accountId = event.params.owner.toHex()
    const tokenId = event.address.toHex()
    const accountAllowance = AccountAllowance.load(accountId + '-' + tokenId)

    if (accountAllowance) {
      accountAllowance.allowance = event.params.value
      accountAllowance.save()

      const account = Account.load(accountAllowance.account)
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
              } else if (wasActive && !offer.isActive) {
                Statistics.decreaseActiveOffersCount()
              }
            }
          }
        }
      }
    }
  }
}
