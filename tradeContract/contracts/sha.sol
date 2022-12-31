// Copyright (c) 2021-2021 Zkrypto Inc.
// SPDX-License-Identifier: LGPL-3.0+
pragma solidity ^0.8.2;


library SHA256
{
    function _hash(bytes32 x, bytes32 y) internal pure returns (bytes32 out) {
        bytes32 res = sha256(abi.encodePacked(x, y));
        
        assembly {
            let r := 21888242871839275222246405745257275088548364400416034343698204186575808495617
            out := addmod(res, 0, r)
        }
    }
}