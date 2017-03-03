"use strict";
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var CounterSchema = Schema({
    _id: {type: String, required: true},
    seq: { type: Number, default: 0 }
});

var counter = mongoose.model('counter', CounterSchema);
counter.collection.drop();

var initialCount = counter({_id: 'url_count', seq: 10000});
initialCount.save(function(err){
  if (err) throw err;
});

var urlSchema = new Schema({
  _id: {type: Number, index: true},
  long_url: String,
  created_at: Date
});

urlSchema.pre('save', function(next){
  var doc = this;
  console.log('doc: ', doc);
  counter.findByIdAndUpdate({_id: 'url_count'}, {$inc: {seq: 1} }, function(error, counter) {
      if (error)
          return next(error);
            // set the _id of the urls collection to the incremented value of the counter
      doc.created_at = new Date();
      console.log('doc.created_at: ', doc.created_at);
      doc._id = counter.seq;
      console.log('doc._id: ', doc._id);
      next();
  });
});

var Url = mongoose.model('Url', urlSchema);
module.exports = Url;
