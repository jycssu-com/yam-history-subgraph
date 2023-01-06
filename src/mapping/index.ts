import { ethereum } from '@graphprotocol/graph-ts'
import { Statistics } from './utils/statistics/Statistics'
import { handleOfferAccepted } from './RealTokenYam/handleOfferAccepted'
import { handleOfferCreated } from './RealTokenYam/handleOfferCreated'
import { handleOfferDeleted } from './RealTokenYam/handleOfferDeleted'
import { handleOfferUpdated } from './RealTokenYam/handleOfferUpdated'
import { handleApproval } from './ERC20/handleApproval'
import { handleTransfer } from './ERC20/handleTransfer'
import { OfferAccepted, OfferCreated, OfferDeleted, OfferUpdated, TokenWhitelistWithTypeToggled } from '../types/RealTokenYam/RealTokenYam'
import { Approval, Transfer } from '../types/RealTokenYam/ERC20'
import { handleTokenWhitelistWithTypeToggled } from './RealTokenYam/handleTokenWhitelistWithTypeToggled'

function beforeHandle (event: ethereum.Event): void {
  Statistics.initialize(event.block.timestamp)
}

function afterHandle (event: ethereum.Event): void {
  Statistics.save()
}

export function offerAcceptedHandler (event: OfferAccepted): void {
  beforeHandle(event)
  handleOfferAccepted(event)
  afterHandle(event)
}

export function offerCreatedHandler (event: OfferCreated): void {
  beforeHandle(event)
  handleOfferCreated(event)
  afterHandle(event)
}

export function offerDeletedHandler (event: OfferDeleted): void {
  beforeHandle(event)
  handleOfferDeleted(event)
  afterHandle(event)
}

export function offerUpdatedHandler (event: OfferUpdated): void {
  beforeHandle(event)
  handleOfferUpdated(event)
  afterHandle(event)
}

export function tokenWhitelistWithTypeToggledHandler (event: TokenWhitelistWithTypeToggled): void {
  beforeHandle(event)
  handleTokenWhitelistWithTypeToggled(event)
  afterHandle(event)
}

export function approvalHandler (event: Approval): void {
  beforeHandle(event)
  handleApproval(event)
  afterHandle(event)
}

export function transferHandler (event: Transfer): void {
  beforeHandle(event)
  handleTransfer(event)
  afterHandle(event)
}
