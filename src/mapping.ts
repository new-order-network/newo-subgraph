import { Address, BigDecimal, Bytes, ethereum } from "@graphprotocol/graph-ts"
import {
  NewOrder,
  Approval,
  NewTokenLock,
  OwnershipTransferred,
  Paused,
  Transfer,
  Unpaused
} from "../generated/NewOrder/NewOrder"
import { Vesting } from "../generated/NewOrder/Vesting"
import { SLP } from "../generated/NewOrder/SLP"
import { SystemState } from "../generated/schema"
import { addressMap, lockedTokens, vestingContracts } from "./utils/addresses"
import { tryNEWOBalanceOf, tryCalcMaxWithdraw, trySLPBalanceOf, trySLPTotalSupply, tryNEWOTotalSupply } from "./utils/readContract"

// Contract events, each is called when its corresponding NEWO contract interaction is triggered

export function handleApproval(event: Approval): void {
  updateSystemState(event)
}

export function handleNewTokenLock(event: NewTokenLock): void {
  updateSystemState(event)
}

export function handleOwnershipTransferred(event: OwnershipTransferred): void {
  updateSystemState(event)
}

export function handlePaused(event: Paused): void {
  updateSystemState(event)
}

export function handleTransfer(event: Transfer): void {
  updateSystemState(event)
}

export function handleUnpaused(event: Unpaused): void {
  updateSystemState(event)
}

// Call this periodically to update system state
// For now, this is triggered by every contract interaction (see above methods)
function updateSystemState(event: ethereum.Event): void {
  let address = addressMap.get('NEWO')

  // Load SystemState, or instantiate for the first time
  let systemState = SystemState.load("0")
  if (!systemState) {
    systemState = new SystemState("0")
    systemState.coinAddress = Bytes.fromByteArray(address)
    systemState.circulatingSupply = BigDecimal.zero()
  }

  // Update values that change, for now just circulating supply
  systemState.circulatingSupply = determineCirculatingSupply()
  systemState.save()
}

// Computes circulating supply by subtracting locked tokens from total supply
function determineCirculatingSupply(): BigDecimal {
  let contract = NewOrder.bind(addressMap.get('NEWO') as Address)

  let totalLockedBalances = BigDecimal.zero()
  for (let i=0; i<lockedTokens.length; i++) {
    totalLockedBalances = totalLockedBalances.plus(tryNEWOBalanceOf(contract, lockedTokens[i]))
  }


  let totalVestingBalances = BigDecimal.zero()
  for (let i=0; i<vestingContracts.length; i++) {
    let vestingContract = Vesting.bind(vestingContracts[i])
    let vestingBalance = tryNEWOBalanceOf(contract, vestingContracts[i])
    let maxWithdraw = tryCalcMaxWithdraw(vestingContract)
    totalVestingBalances = totalVestingBalances.plus(vestingBalance).minus(maxWithdraw)
  }

  let slpContract = SLP.bind(addressMap.get('SLP_TOKEN_ADDRESS'))
  let newoInLpPool = tryNEWOBalanceOf(contract, addressMap.get('NEWO') as Address)
  let gnosisSlpBalance = trySLPBalanceOf(slpContract, addressMap.get('GNOSIS_SAFE_ADDRESS'))
  let slpTotalSupply = trySLPTotalSupply(slpContract)
  let lockedInLp = gnosisSlpBalance.div(slpTotalSupply).times(newoInLpPool)
  
  let oneWaySwapBalance = tryNEWOBalanceOf(contract, addressMap.get('ONE_WAY_SWAP_ADDRESS'))

  let totalSupply = tryNEWOTotalSupply(contract)
  let safeBalance = tryNEWOBalanceOf(contract, addressMap.get('GNOSIS_SAFE_ADDRESS'))

  let circulatingSupply = (totalSupply.minus(safeBalance).minus(totalLockedBalances).minus(totalVestingBalances).minus(lockedInLp).minus(oneWaySwapBalance)).div(BigDecimal.fromString("1000000000000000000"))
  return circulatingSupply
};