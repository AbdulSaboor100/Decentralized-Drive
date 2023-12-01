// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "hardhat/console.sol";

contract Drive {
    struct UserStructure {
        address user;
        string[] fileHashes;
        address[] allAccess;
    }

    mapping(address => UserStructure) private users;
    uint public number_of_files;

    function setFile(string memory _fileHash) external {
        require(
            keccak256(abi.encodePacked(_fileHash)) !=
                keccak256(abi.encodePacked("")),
            "File hash is required"
        );

        if (users[msg.sender].user != address(0)) {
            users[msg.sender].fileHashes.push(_fileHash);
        } else {
            users[msg.sender].user = msg.sender;
            users[msg.sender].fileHashes.push(_fileHash);
        }
        number_of_files++;
    }

    function getFile() external view returns (UserStructure memory) {
        require(users[msg.sender].user == msg.sender, "Files not found");
        return users[msg.sender];
    }

    function getExternalFile(
        address _address
    ) external view returns (string[] memory) {
        string[] memory _fileHashes;
        require(
            users[_address].user != address(0),
            "This address is not available"
        );
        require(
            users[_address].user != msg.sender,
            "This address is not available"
        );
        require(users[_address].allAccess.length > 0, "Access Denied");
        for (uint i = 0; i < users[_address].allAccess.length; i++) {
            require(
                users[_address].allAccess[i] == msg.sender,
                "Access Denied"
            );
            _fileHashes = users[_address].fileHashes;
        }
        return _fileHashes;
    }

    function giveAccess(address _address) external {
        require(
            users[_address].user != msg.sender,
            "You can't give access to yourself"
        );

        for (uint i = 0; i < users[msg.sender].allAccess.length; i++) {
            require(
                users[msg.sender].allAccess[i] != _address,
                "This user has access already"
            );
        }
        users[msg.sender].allAccess.push(_address);
    }
}
