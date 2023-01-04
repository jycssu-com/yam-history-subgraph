import { ethereum } from '@graphprotocol/graph-ts'
import { Statistics } from './utils/statistics/Statistics'
import { handleOfferAccepted } from './RealTokenYam/handleOfferAccepted'
import { handleOfferCreated } from './RealTokenYam/handleOfferCreated'
import { handleOfferDeleted } from './RealTokenYam/handleOfferDeleted'
import { handleOfferUpdated } from './RealTokenYam/handleOfferUpdated'
import { OfferAccepted, OfferCreated, OfferDeleted, OfferUpdated } from '../types/RealTokenYam/RealTokenYam'

function beforeHandle (event: ethereum.Event): void {
  Statistics.initialize(event.block.timestamp)
}

export function offerAcceptedHandler (event: OfferAccepted): void {
  beforeHandle(event)
  handleOfferAccepted(event)
}

export function offerCreatedHandler (event: OfferCreated): void {
  beforeHandle(event)
  handleOfferCreated(event)
}

export function offerDeletedHandler (event: OfferDeleted): void {
  beforeHandle(event)
  handleOfferDeleted(event)
}

export function offerUpdatedHandler (event: OfferUpdated): void {
  beforeHandle(event)
  handleOfferUpdated(event)
}
