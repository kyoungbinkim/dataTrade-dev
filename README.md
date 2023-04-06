# dataTrade-dev

##### nodejs version : 16.18.0  

> tradeContract	  :  data Trade smart contracts
> front/src/cypto :  커브 파라미터, encryption, hash(mimc)  
> front/src/js-libsnark-opt :   
> front/src/libsnark/struct/snarkInput.js :  snark 인풋생성 (dataRegister만 구현되어있)  
> front/src/utils:   
> front/src/test:  react code  

#### prepare libsnark lib
compile from libsnark-optimization and copy lib file to ```server/src/core/libsnark/js-libsnark-opt/libsnark```


#### install front
	cd front
	npm install

#### run front
	cd front
	npm start  

#### run ganache testnet
	cd tradeContract
	npm i
	npm run testrpc  

#### compile solidity contract
	truffle compile  

#### install server
	cd server
	npm install

#### run server
	npm run nodemon


### 경로코드가 있어서 데이터 경로는 수정해서 사용하세요


## Contract 
tradeContract 디렉토리로가서 확인하세요 ~

<img alt="demo" src="dataTradeWeb_demo.gif" >
