# SUSANNA - Hyperledger Fabric Chaincodes
This repository contains four Hyperledger Fabric Chaincodes for a water management system. Each chaincode serves a specific purpose within the system.

## Chaincodes

### Asset

Handles data management. Includes several functions that allow storage, retrieval and data validation. It is inherited by all contracts to provide the above data management characteristics.

### Info

The chaincode through which the assets meters and meter types are managed.

### Readings

Handles the storage, retrieval, update and validation of sensor readings, such as temperature, voltage, and status, from the IOT water meters.

### Readings-Bridge

A bridge contract that manages an intermediate table that associates the meter readings with the corresponding meter.

## Prerequisites

- Hyperledger Fabric environment set up.
- Dependencies for each chaincode installed.

## Installation

1. Clone the repository.
2. Install and deploy each chaincode on a Hyperledger Fabric network


## Usage
- Invoke transactions and query the ledger using the Hyperledger Fabric CLI, SDK or the SUSANNA API.
- Interact with each chaincode based on its specific functionalities.

## License
This project is licensed under the ...
