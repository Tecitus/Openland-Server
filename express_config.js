import mongoose from 'mongoose'


const { Schema } = mongoose;

// 스키마 객체 생성

const buyNftSchema = new Schema({
    title: String,
    item : String,
    category: [String],
    token : [String],
    token_cnt : Number,
    publishedDate: {type: Date, default: Date.now, required: true}
)

const registerNftSchema = new Schema({
    title: {type : String, required: true, unique: true},
    description: {type : String, required: true},
    category: [{type : String, required: true}],
    first_token : [{type : String, required: true}],
    first_token_cnt : {type : Number, required: true},
    token : [{type: String}],
    token_cnt : {type : Number, required: true},
    properties: [{ type : Schema.Types.ObjectId, ref : 'ItemProperty'}],
    publishedDate: {type: Date, default: Date.now, required: true}
    })

var buyNFT = mongoose.model('buyNft', buyNftSchema)
var registerNFt = mongoose.model('registerNFT', registerNftSchema)
var sellNft = mongoose.model('registerNFT', registerNftSchema)
var registerCollection = mongoose.model('registerNFT', registerCollection)
var updateCollection = mongoose.model('registerNFT', updateCollection)
var readTotalTrend = mongoose.model('registerNFT', readTotalTrend)
var readRealTimeBest = mongoose.model('registerNFT', readRealTimeBest)

// registerNft;



const sellNFTSchema = new Schema({
    title: String,
    body: String,
    category: [String],
    publishedDate: {
        type: Date,
        default: Date.now
    })

const registerProjectSchema = new Schema({
    title: String,
    body: String,
    category: [String],
    publishedDate: {
        type: Date,
        default: Date.now
    })


const PostSchema = new Schema({
    title: String,
    body: String,
    category: [String],
    publishedDate: {
        type: Date,
        default: Date.now
    })