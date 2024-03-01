// const Trade_setting = require('../models/Trade_setting')
const { ERRORS, STATUS_CODE, SUCCESS_MSG, STATUS } = require("../constants/index");
const { ObjectId } = require('mongodb');
const Transaction = require('../models/Transaction')
const Contract = require('../models/Contract')

const get_transaction = async(req, res) => {
    try{
        let {contract_address, from_date, to_date, sorting, sorting_field, trx_hash, limit, page_number} = req.body;
        let query = {}
        if(contract_address){
            query.contract_address = contract_address; 
        }
        if(from_date && to_date){
            query.CreatedAt = {$and : [{$gte : from_date}, {$lte : to_date}]}; 
        }
        if(trx_hash){
            query.transaction_hash = trx_hash
        }
        console.log(query);
        let transactionData = await Transaction.find(query).sort({CreatedAt: -1}).skip((page_number - 1) * limit).limit(limit);
        return res.status(200).json({
            status: '200',
            data: transactionData,
        });
    }catch(error){
        return res.status(STATUS_CODE.FORBIDDEN).json({
            status: "error",
            message: error,
        });
    }
}

const add_contract = async(req, res) => {
    try{
       let {contract_address} = req.body
       let checkStatus = await Contract.countDocuments({contract_address: contract_address})
       if(checkStatus > 0){
        return res.status(200).json({
            status: 200,
            Message: "contract address is already added",
        });
       }
        await Contract.create({contract_address})
        return res.status(200).json({
            status: 200,
            Message: "contract address is added successfully",
        });
    }catch(error){
        return res.status(STATUS_CODE.FORBIDDEN).json({
            status: "error",
            message: error,
        });
    }
}

const get_contract = async(req, res) => {
    try{
        let data = await Contract.find({})
        return res.status(200).json({
            status: 200,
            data : data
        });
    }catch(error){
        return res.status(STATUS_CODE.FORBIDDEN).json({
            status: "error",
            message: error,
        });
    }
}

const delete_contract = async(req, res) => {
    try{
        let {contract_id} = req.body
        await Contract.deleteOne({_id : new ObjectId(contract_id)})
        return res.status(200).json({
            status: 200,
            Message: "Contract is deleted successfully",
        });
    }catch(error){
        return res.status(STATUS_CODE.FORBIDDEN).json({
            status: "error",
            message: error,
        });
    }
}

module.exports = {
    get_transaction,
    add_contract,
    get_contract,
    delete_contract
}