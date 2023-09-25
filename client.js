/**
 * client.js
 */

const util = require('util');

const mc = require('mcprotocol');
// const S7 = require('./lib/fakeS7');

let variables = {};

module.exports = {
  conn: '',

  init(plugin) {
    this.plugin = plugin;
    if (plugin.params.data.useFakeS7) {
      this.plugin.log('USE fake S7!', 1);

      //const S7 = require('./lib/fakeS7');
      //this.conn = new S7(plugin);
    } else {
      //const S7 = require('nodes7');
      this.conn = new mc();
    }
    
    this.addItems(this.plugin.channels);
    
  },

  getConnState() {
    return this.conn.isoConnectionState;
  },

  addItems(channels) {
    variables = {};
    // Заполнить variables из каналов
    for (var i=0; i < channels.data.length; i++) {
      variables[channels.data[i].chan] = channels.data[i].address;
      // делаем что-нибудь с item
    }
    this.conn.setTranslationCB(tag => variables[tag]);  
    this.plugin.log('Variables mapping: ' + util.inspect(variables));
    // Заполнить read pool для readAll
    this.conn.addItems(Object.keys(variables));
  },

  removeItems() {
    const vars = Object.keys(variables);
    //console.log('Removed vars', vars);
    try {
    this.conn.removeItems(vars);
    
  } catch (e) {
    plugin.log('ERROR onChange: ' + util.inspect(e));
  }
  },

  connect() {
    const host = this.plugin.params.data.host;

    const port = Number(this.plugin.params.data.port);
    const ascii = this.plugin.params.data.ascii;
    this.plugin.log('Try connect to ' + host + ':' + port), 1;

    // const cParam = { port, host, rack: 0, slot: 1 };
    const cParam = { port, host, ascii};
   

    return new Promise((resolve, reject) => {
      this.conn.initiateConnection(cParam, err => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  },

  readAll() {
    return new Promise((resolve, reject) => {
      this.conn.readAllItems((err, values) => {
        if (err) {
          reject(err);
        } else {
          resolve(values);
        }
      });
    });
  },

  write(items, values) {
    return new Promise((resolve, reject) => {
      // this.conn.writeItems(['TEST5', 'TEST6'], [ 867.5309, 9 ], valuesWritten);
      this.conn.writeItems(items, values, err => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  },

  close() {
    return new Promise((resolve, reject) => {
      this.conn.dropConnection(err => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
};
