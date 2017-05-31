/*

    uparser.js

    a µblocks message protocol for the µblocks VM


    written by John Maloney, Jens Mönig, and Bernat Romagosa
    jens@moenig.org

    Copyright (C) 2017 by John Maloney, Jens Mönig, Bernat Romagosa

    This file is part of Snap!.

    Snap! is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of
    the License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.


    prerequisites:
    --------------


    toc
    ---
    the following list shows the order in which all constructors are
    defined. Use this list to locate code in this document:

        Protocol
        Postal


    credits
    -------
    John Maloney designed the original µblocks bytecode system

*/

// Global stuff ////////////////////////////////////////////////////////

/*global modules */

// Utility functions

Array.prototype.toHexString = function () {
    return (this.map(function (each) { return each.toString(16); })).toString();
};

// µBlocks message protocol

function Protocol () {
    this.init();
};

Protocol.prototype.init = function () {
    this.messageBuffer = [];
};

Protocol.prototype.processRawData = function (data) {
    this.messageBuffer = this.messageBuffer.concat(data.split(','));
    this.parseMessage();
};

Protocol.prototype.parseMessage = function () {
    var descriptor = this.descriptors[this.messageBuffer[0]],
        dataSize;

    console.log('→ ' + this.messageBuffer.toHexString());

    if (!descriptor) {
        // We probably connected to the board while it was sending a message
        // and missed its header.
        this.messageBuffer = [];
        return;
    }

    if (descriptor.carriesData && this.messageBuffer.length >= 4) {
        dataSize = this.messageBuffer[2] | this.messageBuffer[3] << 8;
        if (this.messageBuffer.length === dataSize + 4) {
            // The message is complete, let's parse it.
            this.printMessage(descriptor, dataSize);
            this.messageBuffer = this.messageBuffer.slice(4 + dataSize);
        } 
    } else if (!descriptor.carriesData && this.messageBuffer.length === 2) {
        // this message carries no data and is complete
        this.printMessage(descriptor);
        this.messageBuffer = this.messageBuffer.slice(2);
    } 
};

// Just for test purposes
Protocol.prototype.printMessage = function (descriptor, dataSize) {
    var data;
    console.log('===');
    console.log('Message complete');
    console.log('OpCode:\t\t\t' + this.messageBuffer[0].toString(16));
    console.log('Description:\t\t' + descriptor.description);
    console.log('Object ID:\t\t' + this.messageBuffer[1]);
    console.log('Origin:\t\t\t' + descriptor.origin);
    console.log('Carries data:\t\t' + (descriptor.carriesData && dataSize > 0));
    if (dataSize) {
        data = this.messageBuffer.slice(4, 4 + dataSize);
        console.log('Data size:\t\t' + dataSize);
        console.log('Data:\t\t\t' + data.reverse().toHexString());
        if (descriptor.dataDescriptor) {
            console.log('Data description:\t' + descriptor.dataDescriptor[data]);
        }
    }
    console.log('===');
};

Protocol.prototype.packMessage = function (selector, stackId, data) {
    var opCode = this.opCodeFor(selector),
        messageId = Math.floor(Math.random() * 255), // temporary
        message = [opCode, messageId, stackId];

    if (data) {
        if (selector === 'storeChunk') {
            // chunkType, hardcoded for now
            data = [1].concat(data);
        }

        // add the data size in little endian
        message = message.concat(data.length & 255).concat((data.length >> 8) & 255);

        // add the data
        message = message.concat(data);
    } else {
        message = message.concat([0, 0]);
    }

    console.log(message);
    return message;
};

Protocol.prototype.opCodeFor = function (selector) {
    for (var i = 0; i < this.descriptors.length; i += 1) {
        if (this.descriptors[i].selector === selector) {
            return i;
        }
    }
};
// Message descriptors

Protocol.prototype.descriptors = [
    {
        description: 'Okay reply',
        origin: 'board',
        carriesData: false
    },
    {
        description: 'Error reply',
        origin: 'board',
        carriesData: true,
        dataDescriptor: {
            0x00: 'Division by zero',
            0xFF: 'Generic Error'
        }
    },
    {
        description: 'Store a code chunk',
        selector: 'storeChunk',
        origin: 'ide',
        carriesData: true
    },
    {
        description: 'Delete a code chunk',
        selector: 'deleteChunk',
        origin: 'ide',
        carriesData: false
    },
    {
        description: 'Start all threads',
        selector: 'startAll',
        origin: 'ide',
        carriesData: false
    },
    {
        description: 'Stop all threads',
        selector: 'stopAll',
        origin: 'ide',
        carriesData: false
    },
    {
        description: 'Start a code chunk',
        selector: 'startChunk',
        origin: 'ide',
        carriesData: false
    },
    {
        description: 'Stop a code chunk',
        selector: 'stopChunk',
        origin: 'ide',
        carriesData: false
    },
    {
        description: 'Get task status',
        selector: 'getTaskStatus',
        origin: 'ide',
        carriesData: false
    },
    {
        description: 'Get task status reply',
        origin: 'board',
        carriesData: true
    },
    {
        description: 'Get output message',
        selector: 'getOutputMessage',
        origin: 'ide',
        carriesData: false
    },
    {
        description: 'Get output message reply',
        origin: 'board',
        carriesData: true
    },
    {
        description: 'Get return value',
        selector: 'getReturnValue',
        origin: 'ide',
        carriesData: false
    },
    {
        description: 'Get return value reply',
        origin: 'board',
        carriesData: true
    },
    {
        description: 'Get error info',
        selector: 'getErrorInfo',
        origin: 'ide',
        carriesData: false
    },
    {
        description: 'Get error info reply',
        origin: 'board',
        carriesData: true
    }
    /* debug messages
    ,
    {
        description: 'Show chunks',
        origin: 'ide',
        carriesData: false
    },
    {
        description: 'Show tasks',
        origin: 'ide',
        carriesData: false
    }
    */
];

function Postal (address, onReceive) {
    this.init(address, onReceive);
};

Postal.prototype.init = function (address, protocol) {
    this.address = address;
    this.protocol = new Protocol();
    this.socket = null;

    this.startAutoConnect();
};

Postal.prototype.startAutoConnect = function () {
    var myself = this;
    this.connectInterval = setInterval(function () { myself.initSocket() }, 1000);
};

Postal.prototype.initSocket = function () {
    var myself = this;

    this.socket = new WebSocket(this.address);

    this.socket.addEventListener('open', function() {
        console.log('socket connection open, clearing autoconnect interval');
        clearInterval(myself.connectInterval);
        myself.connectInterval = null;
    });

    this.socket.onmessage = function (event) {
        myself.protocol.processRawData(event.data);
    };

    this.socket.onclose = function () {
        this.socket = null;
        console.log('socket connection closed, restarting autoconnect interval');
        myself.startAutoConnect();
    };
};

Postal.prototype.rawSend = function (message) {
    console.log('sending ' + message);
    if (this.socket) {
        this.socket.send((new Uint8Array(message)).buffer);
    }
};

Postal.prototype.sendMessage = function (selector, stackId, data) {
    this.rawSend(this.protocol.packMessage(selector, stackId, data));
};
