import { BigInt } from '@graphprotocol/graph-ts'
import { AccountAllowance, AccountBalance, Offer } from '../../../types/schema'

export function computeOfferFields (offer: Offer): void {
  offer.quantityAvailable = getAvailableQuantityOffer(offer)
  offer.isActive = isActiveOffer(offer)
}

function getAvailableQuantityOffer (offer: Offer): BigInt {
  const accountBalance = AccountBalance.load(offer.maker + '-' + offer.offerToken)
  const accountAllowance = AccountAllowance.load(offer.maker + '-' + offer.offerToken)

  const quantity = offer.quantity
  const balance = accountBalance ? accountBalance.balance : BigInt.fromI32(0)
  const allowance = accountAllowance ? accountAllowance.allowance : BigInt.fromI32(0)

  if (quantity.lt(balance) && quantity.lt(allowance)) {
    return quantity
  } else if (balance.lt(quantity) && balance.lt(allowance)) {
    return balance
  } else {
    return allowance
  }
}

function isActiveOffer (offer: Offer): boolean {
  if (offer.removedAtBlock) {
    return false
  }

  if (offer.quantityAvailable.le(BigInt.fromI32(0))) {
    return false
  }

  return true
}