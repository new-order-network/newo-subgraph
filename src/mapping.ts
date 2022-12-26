import { Address, BigDecimal, Bytes, ethereum } from "@graphprotocol/graph-ts"
import {
  NewOrder,
  Approval,
  NewTokenLock,
  OwnershipTransferred,
  Paused,
  Transfer,
  Unpaused,
} from "../generated/NewOrder/NewOrder"
import { Vesting } from "../generated/NewOrder/Vesting"
import { SLP } from "../generated/NewOrder/SLP"
import { SystemState } from "../generated/schema"
import {
  NEWO_TOKEN_ADDRESS,
  SLP_TOKEN_ADDRESS,
  GNOSIS_SAFE_ADDRESS,
  ONE_WAY_SWAP_ADDRESS,
  LOCKED_TOKEN_ADDRESS_LIST,
  VESTING_CONTRACTS_ADDRESS_LIST,
  VENEWO_TOKEN_ADDRESS,
  SUSHISWAP_ADDRESS,
} from "./utils/addresses"
import {
  tryNEWOBalanceLocked,
  tryNEWOBalanceOf,
  tryCalcMaxWithdraw,
  trySLPBalanceOf,
  trySLPTotalSupply,
  tryNEWOTotalSupply,
} from "./utils/readContract"

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
  // Load SystemState, or instantiate for the first time
  let systemState = SystemState.load("0")

  if (!systemState) {
    systemState = new SystemState("0")
    systemState.coinAddress = Bytes.fromByteArray(NEWO_TOKEN_ADDRESS)
    systemState.circulatingSupply = BigDecimal.zero()
  }

  // Update values that change, for now just circulating supply
  systemState.circulatingSupply = determineCirculatingSupply()
  systemState.save()
}

// Computes circulating supply by subtracting locked tokens from total supply
function determineCirculatingSupply(): BigDecimal {
  let contract = NewOrder.bind(NEWO_TOKEN_ADDRESS)

  // Total NEWO token supply
  let totalSupply = tryNEWOTotalSupply(contract)

  // Locked token balance total
  let totalLockedBalances = BigDecimal.zero()
  for (let i = 0; i < LOCKED_TOKEN_ADDRESS_LIST.length; i++) {
    totalLockedBalances = totalLockedBalances.plus(
      tryNEWOBalanceLocked(contract, LOCKED_TOKEN_ADDRESS_LIST[i])
    )
  }

  // Vesting contract balance total
  let totalVestingBalances = BigDecimal.zero()
  for (let i = 0; i < VESTING_CONTRACTS_ADDRESS_LIST.length; i++) {
    let vestingBalance = tryNEWOBalanceOf(contract, VESTING_CONTRACTS_ADDRESS_LIST[i])

    totalVestingBalances = totalVestingBalances.plus(vestingBalance)
  }

  // Supply locked in sushi liquidy pools
  let slpContract = SLP.bind(SLP_TOKEN_ADDRESS)
  let newoInLpPool = tryNEWOBalanceOf(contract, SLP_TOKEN_ADDRESS)
  let gnosisSlpBalance = trySLPBalanceOf(slpContract, GNOSIS_SAFE_ADDRESS)
  let slpTotalSupply = trySLPTotalSupply(slpContract)
  let lockedInLp = gnosisSlpBalance.div(slpTotalSupply).times(newoInLpPool)

  // Gnosis and swap contract supply
  let safeBalance = tryNEWOBalanceOf(contract, GNOSIS_SAFE_ADDRESS)
  let oneWaySwapBalance = tryNEWOBalanceOf(contract, ONE_WAY_SWAP_ADDRESS)

  // Supply locked in veNEWO
  let veNewoBalance = tryNEWOBalanceOf(contract, VENEWO_TOKEN_ADDRESS)

  // Supply locked in veNEWO
  let sushiswapBalance = tryNEWOBalanceOf(contract, SUSHISWAP_ADDRESS)

  let circulatingSupply = totalSupply
    .minus(totalLockedBalances)
    .minus(totalVestingBalances)
    .minus(lockedInLp)
    .minus(safeBalance)
    .minus(oneWaySwapBalance)
    .minus(veNewoBalance)
    .minus(sushiswapBalance)
    .div(BigDecimal.fromString("1000000000000000000"))

  return circulatingSupply
}
