// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

contract SharedWallet
{
    address public walletAddress;
    mapping(address => uint256) public MemberBalance;

    constructor()
    {
        walletAddress = msg.sender;
    }

    // one have to deposit 0.001 eth to take membership in this SharedWallet
    function takeMembership() public payable
    {
        require(msg.value == 1000000000000000, "You have to deposit 0.001 eth to become a Member of this wallet!");
        MemberBalance[msg.sender] += msg.value;
    }

    // all the deposited money including the initially deposited 0.001 eth will be returned during the Account deletion
    function deleteMembership(address payable _to) public payable
    {
        require(MemberBalance[msg.sender] >= 1000000000000000, "You are not a Member of this wallet");
        _to.transfer(MemberBalance[msg.sender]);
        MemberBalance[msg.sender] = 0;
    }

    function putMoney() public payable 
    {
        require(msg.value != 0, "You need to deposit some amount of money!");
        MemberBalance[msg.sender] += msg.value;
    }

    function takeMoney(address payable _to, uint256 _total) public payable
    {
        require(_total <= (MemberBalance[msg.sender] - 1000000000000000), "You have insufficient balance");
        MemberBalance[msg.sender] -= _total;
        _to.transfer(_total);
    }

    function getMemberBalance() external view returns (uint256)
    {
        return MemberBalance[msg.sender];
    }

    function getWalletBalance() public view returns (uint256)
    {
        return address(this).balance;
    }
}
