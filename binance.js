const Binance = require('binance-api-node').default
const client = Binance({
  apiKey: '',
  apiSecret: ''
})
let ticks = []
let bases = []
let vols = {}
let cs = {}
let tickVols = {}

client.ws.allTickers(tickers => {
  for(var t in tickers){
  	let spread = (100*(1-parseFloat(tickers[t].bestBid)/parseFloat(tickers[t].bestAsk) ))
  	if (!ticks.includes(tickers[t].symbol) && spread > 1){
  		tickVols[tickers[t].symbol] = (parseFloat(tickers[t].volumeQuote))
  		if (tickers[t].symbol.substring(tickers[t].symbol.length -4, tickers[t].symbol.length).includes('USD')){
  			if (!bases.includes(tickers[t].symbol.substring(tickers[t].symbol.length -4, tickers[t].symbol.length))){
  			bases.push(tickers[t].symbol.substring(tickers[t].symbol.length -4, tickers[t].symbol.length))
  		}
  		}
  		else {
if (!bases.includes(tickers[t].symbol.substring(tickers[t].symbol.length -3, tickers[t].symbol.length))){
  			bases.push(tickers[t].symbol.substring(tickers[t].symbol.length -3, tickers[t].symbol.length))
  		}
  		}
  		ticks.push(tickers[t].symbol)
  	for(var t in tickers){
    	for (b in bases){
    		if (vols[bases[b]] == undefined){
    			vols[bases[b]] = 0;
    			cs[bases[b]] = 0;
    		}
    		if (tickers[t].symbol.substring(tickers[t].symbol.length -4, tickers[t].symbol.length) == bases[b]){
    		vols[bases[b]]+=(parseFloat(tickers[t].volumeQuote));
    	cs[bases[b]]++;
    	} else if (tickers[t].symbol.substring(tickers[t].symbol.length -3, tickers[t].symbol.length) == bases[b]) {
    		vols[bases[b]]+=(parseFloat(tickers[t].volumeQuote));
    	cs[bases[b]]++;
    	}
}

  }

  }
}
})
askOrders = {}
bidOrders = {}
let count = 1;
let lala = 0;
let precisions = {}
let filters = {}
setTimeout(async function(){
	let exchange = (await client.exchangeInfo())
	for (var symbol in exchange.symbols){
		precisions[exchange.symbols[symbol].symbol] = {'base': exchange.symbols[symbol].baseAsset, 'quote': exchange.symbols[symbol].quoteAsset, 'bp': exchange.symbols[symbol].baseAssetPrecision, 'qp': exchange.symbols[symbol].quotePrecision}
		filters[exchange.symbols[symbol].symbol] = {'minPrice': parseFloat(exchange.symbols[symbol].filters[0].minPrice),
		'minQty':parseFloat(exchange.symbols[symbol].filters[2].minQty),
		'tickSize': countDecimalPlaces(parseFloat(exchange.symbols[symbol].filters[0].tickSize)),
		'stepSize': countDecimalPlaces(parseFloat(exchange.symbols[symbol].filters[2].stepSize)),
		'minNotional': parseFloat(exchange.symbols[symbol].filters[3].minNotional)}
	}
	let balances = (await client.accountInfo()).balances
  for (var b in balances){
  	bals[balances[b].asset] = balances[b].free
  }
let gos = {}
	let avgs = {}
  for (var v in vols){
  	avgs[v] = vols[v] / cs[v];
  }
  for (var a in avgs){
  	for (var t in tickVols){

  		if (t.substring(t.length -3, t.length) == a){	
  			if (tickVols[t] > avgs[a] / 3&& tickVols[t] < avgs[a] * 3 ){
  				if (gos[a] == undefined){
  					gos[a] = {}
  				}
  				gos[a][(t)] = tickVols[t];
  			}
  		} else if (t.substring(t.length -4, t.length) == a){
			if (tickVols[t] > avgs[a] / 3 && tickVols[t] < avgs[a] * 3 ){
  				if (gos[a] == undefined){
  					gos[a] = {}
  				}
  				gos[a][(t)] = tickVols[t];
  			}
  		}
  		
  	}
  }
  for(var g in gos){
  	for (var symbol in gos[g]){
  		let book = (await client.book({ symbol: symbol }))
  		let hb = 0;
  		for (var bid in book.bids){
  			if (parseFloat(book.bids[bid].price) > hb){
  				hb = parseFloat(book.bids[bid].price);
  			}
  		}
  		let la = 50000000000000000000000;
  		for (var ask in book.asks){
  			if (parseFloat(book.asks[ask].price) < la){
  				la = parseFloat(book.asks[ask].price)
  			}
  		}
  		console.log(symbol + ' la: ' + la + ' hb: ' + hb)
  		if (las[symbol] != la && hbs[symbol] != hb){
  		if (symbol.substring(symbol.length - 4, symbol.length) == g){


  		} else if (symbol.substring(symbol.length - 3, symbol.length) == g){
  				asset = symbol.substring(0, symbol.length-3)
  				console.log('asset: ' + asset)
  				
  				if (lala == 0){
  					console.log(precisions[symbol]);
  					console.log(filters[symbol])
  					console.log((bals[symbol.substring(symbol.length - 3, symbol.length)] / (hb * 1.0001)).toFixed(filters[symbol].stepSize - 1));
  					bp = ( hb * 1.0001)
  					bp = bp.toFixed(filters[symbol].tickSize - 1)
  					sp = (la * .9999)
  					sp = sp.toFixed(filters[symbol].tickSize - 1)
  					buyQty = ((bals[symbol.substring(symbol.length - 3, symbol.length)] / (hb * 1.0001)).toFixed(filters[symbol].stepSize - 1));
  					let dontgo = false;
  					console.log(buyQty)
  					console.log(bp)
  					if ((buyQty * hb * 1.0001)< filters[symbol].minNotional){
  						console.log('dontgo minnotional')
  						dontgo = true;
  					}
  				    if (buyQty  < filters[symbol].minQty){

  						console.log('dontgo minqty')
  						dontgo = true;  			
  							    }
  							    if (dontgo == false){
  					
				//lala++;
				try {
  			buys.push(await client.order({
				  symbol: symbol,
				  side: 'BUY',
				  quantity: buyQty,
				  price: bp,
				}))
		  		sells.push(await client.order({
				  symbol: 'symbol',
				  side: 'SELL',
				  quantity: bals[asset],
				  price: sp,
				}))
				console.log(buys);
				console.log(sells);
				} catch (err){

					console.log(err);
				}
				}
			}

  		} 

  		las[symbol] = la;
  		hbs[symbol] = hb;
  		}
  		/*

  		 */
  }
  }
  	
  console.log(count * 1 + ' minutes')
  
  count++;
}, 10000)
let bals = {}
function countDecimalPlaces(number) { 
  var str = "" + number;
  if (str == '1e-7'){
  	str = "0.0000001"
  } else {

  if (str == '1e-8'){
  	str = "0.00000001"
  }
  var index = str.indexOf('.');

  
  }
  if (index >= 0) {
    return str.length - index;
  } else {
    return 1;
  }
}
let buys = []
let sells = []
let las = {}
let hbs = {}
let aorders = {}
let borders = {}