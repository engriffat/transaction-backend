// const Trade_setting = require('../models/Trade_setting')
const { ERRORS, STATUS_CODE, SUCCESS_MSG, STATUS } = require("../constants/index");
const { ObjectId } = require('mongodb');
const Transaction = require('../models/Transaction')
const Contract = require('../models/Contract')
const Volume = require('../models/Volume')
const telegram_alert = require('../models/telegram_alert')
const new_token = require('../models/new_token')
const get_transaction = async(req, res) => {
    try{
        console.log(req.body)
        let {contract_address, from_date, to_date, limit, page_number, status, hash, from_value, to_value, from_gas, to_gas} = req.body;
        let query = {}
        if(hash){
            query.transaction_hash = hash;
        }
        if(status){
            query.status = status;
        }
        if(from_value && to_value){
            query['value'] = { $gte: from_value, $lte: to_value};
        }
        if(from_gas && to_gas){
            query['gas'] = { $gte: from_gas, $lte: to_gas};
        } 
        if(contract_address){
            query = {$or : [{to_address : contract_address}, {from_address : contract_address}]}
        }
        if(from_date && to_date){
            query['createdAt'] = { $gte: new Date(from_date), $lte: new Date(to_date) };
        }
        console.log("query", query)
        let count = await Transaction.countDocuments(query);
        let transactionData = await Transaction.aggregate([
            {
                $match : query
            }, 
            {
                $sort : {createdAt : -1}
            },
            {
                $skip : (page_number - 1) * limit
            },
            {
                $limit : limit
            }
        ])

        let buy_Volume = await Transaction.aggregate([
            {
                $match : {
                    to_address : contract_address
                }
            }, 
            {
                $group : {
                    _id : null,
                    value : {$sum : "$value"},
                    number_of_buyer : {$sum :1}
                }
            }
        ])

        let sell_Volume = await Transaction.aggregate([
            {
                $match : {
                    from_address : contract_address
                }
            }, 
            {
                $group : {
                    _id : null,
                    value : {$sum : "$value"},
                    number_of_seller : {$sum :1}

                }
            }
        ])
        console.log("sell volume ==>>>", sell_Volume)
        console.log("buy volume ==>>>", buy_Volume)

        let calculation = await Transaction.aggregate([
            {
                $match : query
            },
            {
                $group : {
                    _id : null,
                    value_sum : {$sum : "$value"},
                    gas_sum : {$sum : "$gas"}
                }
            }
        ])
        let volumeData = await Volume.findOne({contract_address : contract_address})
        let buyVolume =  buy_Volume.length > 0 ? buy_Volume[0].value : 0;
        let sellVolume =  sell_Volume.length > 0 ? sell_Volume[0].value : 0;
        return res.status(200).json({
            status: '200',
            data: transactionData,
            count : count,
            calculation : calculation,
            vloume : volumeData,
            buy_volume: buy_Volume.length > 0 ? buy_Volume[0] : {},
            sell_volume: sell_Volume.length > 0 ? sell_Volume[0] : {},
            net_volume :  buyVolume+sellVolume,
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

const getNew_token = async(req, res) => {
    try{
        let{page_number, limit, contract_address, form_liquadity, to_liquadity, from_buy_volume, to_buy_volume, from_sell_volume, to_sell_volume} = req.body
        let query = {}
        if(contract_address){
            query.contract_address = contract_address;
        }
        if(form_liquadity && to_liquadity){
            query['value'] = { $gte: form_liquadity, $lte: to_liquadity};
        }
        if(from_buy_volume && to_buy_volume){
            query['value'] = { $gte: from_buy_volume, $lte: to_buy_volume};
        }
        if(from_sell_volume && to_sell_volume){
            query['value'] = { $gte: from_sell_volume, $lte: to_sell_volume};
        }
        console.log("query", query)
        let count = await new_token.countDocuments(query)
        let data = await new_token.find(query).sort({createdAt : -1}).skip((Number(page_number) - 1) * limit).limit(Number(limit))
        return res.status(200).json({
            status: 200,
            data,
            count
        });
    }catch(error){
        return res.status(STATUS_CODE.FORBIDDEN).json({
            status: "error",
            message: error,
        });
    }
}

const addTelegtam_alerts = async(req, res) => {
    try{
        let {field_name, from_value, to_value, contract_address} = req.body
        let insertObj = {
            field_name, 
            from_value, 
            to_value, 
            contract_address
        }
        await telegram_alert.create(insertObj)
        return res.status(200).json({
            status: 200,
            message: "Successfullt added new alert",
        });
    }catch(error){
        console.log(error)
        return res.status(STATUS_CODE.FORBIDDEN).json({
            status: "error",
            message: error,
        });
    }
}
module.exports = {
    addTelegtam_alerts,
    get_transaction,
    add_contract,
    get_contract,
    delete_contract,
    getNew_token
}