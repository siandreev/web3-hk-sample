import { Base64 } from '@tonconnect/protocol';
import {Address, beginCell, contractAddress as calculateContractAddress, Cell, StateInit, storeStateInit} from 'ton';

const OFFCHAIN_CONTENT_PREFIX = 0x01;
const nftUri = 'https://siandreev.github.io/web3-hk-sample/nft-data.json';

function bufferToChunks(buff: Buffer, chunkSize: number) {
    const chunks: Buffer[] = [];
    while (buff.byteLength > 0) {
        chunks.push(buff.subarray(0, chunkSize));
        buff = buff.subarray(chunkSize);
    }
    return chunks;
}

function makeSnakeCell(data: Buffer): Cell {
    const chunks = bufferToChunks(data, 127);

    if (chunks.length === 0) {
        return beginCell().endCell();
    }

    if (chunks.length === 1) {
        return beginCell().storeBuffer(chunks[0]).endCell();
    }

    let curCell = beginCell();

    for (let i = chunks.length - 1; i >= 0; i--) {
        const chunk = chunks[i];

        curCell.storeBuffer(chunk);

        if (i - 1 >= 0) {
            const nextCell = beginCell();
            nextCell.storeRef(curCell);
            curCell = nextCell;
        }
    }

    return curCell.endCell();
}


const contractCode =
    'te6cckECDgEAAdwAART/APSkE/S88sgLAQIBYgINAgLOAwoCASAECQLPDIhxwCSXwPg0NMDAXGwkl8D4PpA+kAx+gAxcdch+gAx+gAwc6m0APACBLOOFDBsIjRSMscF8uGVAfpA1DAQI/AD4AbTH9M/ghBfzD0UUjC64wIwNDQ1NYIQL8smohK64wJfBIQP8vCAFCAKsMhA3XjJAE1E1xwXy4ZH6QCHwAfpA0gAx+gAg10nCAPLixIIK+vCAG6EhlFMVoKHeItcLAcMAIJIGoZE24iDC//LhkiGUECo3W+MNApMwMjTjDVUC8AMGBwB8ghAFE42RyFAJzxZQC88WcSRJFFRGoHCAEMjLBVAHzxZQBfoCFctqEssfyz8ibrOUWM8XAZEy4gHJAfsAEEcAaibwAYIQ1TJ22xA3RABtcXCAEMjLBVAHzxZQBfoCFctqEssfyz8ibrOUWM8XAZEy4gHJAfsAAHJwghCLdxc1BcjL/1AEzxYQJIBAcIAQyMsFUAfPFlAF+gIVy2oSyx/LPyJus5RYzxcBkTLiAckB+wAAET6RDBwuvLhTYAIBIAsMADs7UTQ0z/6QCDXScIAmn8B+kDUMBAkECPgMHBZbW2AAHQDyMs/WM8WAc8WzMntVIAAJoR+f4AUR8jb8';
const initCodeCell = Cell.fromBase64(contractCode);

const serializeUri = (uri: string): Uint8Array => {
    return new TextEncoder().encode(encodeURI(uri));
};

const createOffchainUriCell = (uri: string) => {
    let data = Buffer.from(uri);
    const offChainPrefix = Buffer.from([0x01]);
    data = Buffer.concat([offChainPrefix, data]);
    return makeSnakeCell(data);

   /* return beginCell()
        .storeUint(OFFCHAIN_CONTENT_PREFIX, 8)
        .storeBuffer(Buffer.from(serializeUri(uri)))
        .endCell();*/
};

function generateInitialData(ownerAddressHex: string): Cell {
    const nftContent = createOffchainUriCell(nftUri);

    const builder = beginCell()
        .storeUint(0, 64)
        .storeUint(0, 2)
        .storeAddress(Address.parseRaw(ownerAddressHex))
        .storeUint(Date.now(), 64)
        .storeRef(nftContent);

    return builder.endCell();
}

function generateStateInit(data: Cell): string {
    return callToBase64(beginCell().store(storeStateInit({ code: initCodeCell, data })).endCell());
}

function callToBase64(cell: Cell): string {
    return Base64.encode(cell.toBoc());
}

function generateContractAddress(initDataCell: Cell): string {
    return calculateContractAddress(0, {
        data: initDataCell,
        code: initCodeCell,
    }).toString();
}

export function getAddressAndStateInit(ownerAddress: string): { address: string; stateInit: string } {
    const initialData = generateInitialData(ownerAddress);
    const address = generateContractAddress(initialData);
    const stateInit = generateStateInit(initialData);
    return { address, stateInit };
}

export function generatePayload(sendTo: string): string {
    const op = 0x5fcc3d14; // transfer
    const quiryId = 0;
    const messageBody = beginCell()
        .storeUint(op, 32)
        .storeUint(quiryId, 64)
        .storeAddress(Address.parse(sendTo))
        .storeAddress(Address.parse(sendTo))
        .storeBit(false)
        .storeCoins(0)
        .storeBit(0)
        .endCell();

    return Base64.encode(messageBody.toBoc());
}

export function getRawAddress(userFriendlyAddress: string): string {
    return Address.parse(userFriendlyAddress).toString();
}
