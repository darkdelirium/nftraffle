import React, {useState, useEffect} from 'react'
import logo from './logo.svg'
import {InputGroup, Button, FormControl, Form, Dropdown, DropdownButton} from 'react-bootstrap'
import { states, countries } from './states'
import { ContractABI } from "./ABI"
import { apiKey, nftRaffleWallet } from './config'
import circle from './service/circle'

import Web3 from 'web3'
import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css'

const priceTable = {
  eth: '0.00001',
  usdc: '1'
}

const web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:7545'))
web3.eth.defaultAccount = web3.eth.accounts[0]

const RemixContract = new web3.eth.Contract(
  ContractABI,
  "0xb369f11d3CfD87aEf769e3cFdEB21d68e43152EB"
  //"0x677BB4A98566ab3e12E7178A0C06Ae3A3988A2A7"
)


const getCountryName = ({code}) => {
  const currentCountry =  countries.find(country=> country.code === code)
  const countryName = currentCountry ? currentCountry.name : 'Select Country'
  return countryName
}

const getStateName = ({code}) => {
  const currentState =  states.find(state=> state.abbreviation === code)
  const stateName = currentState ? currentState.name : 'Select State'
  return stateName
}

const ticketPrice = '0.001'

const getPrice = (price, amount, currency) => {
  const ticketPrice = priceTable[currency.toLowerCase()]
  const result = amount*ticketPrice || amount*price
  console.log(amount, price, currency, ticketPrice, result)
  return result
}

function App() {
  const [currentState, setCurrentState] = useState('')
  const [currentCountry, setCurrentCountry] = useState('')
  const [ethA, setEthA] = useState(0)
  const [notes, setNotes] = useState('')
  const [user, setUser] = useState('')
  const [tickets, setTickets] = useState('')
  const [currentCurrency, setCurrentCurrency] = useState('ETH')
  const [circleAccountParams,setCircleAccountParams] = useState({})
  
  const handleFormSubmit = () => {
    return {
      user,
      country: currentCountry,
      state: currentState,
      ethamount: ethA,
      notes
    }
  }

  const getDefaultData = async e => {
    RemixContract.methods
      .defaultMessage()
      .call()
      .then(console.log)
  }

  const setData = async (messagea) => {
    //e.preventDefault()
    //const message = 'test message'
    const message = JSON.stringify(messagea)
    const accounts = await window.ethereum.enable()
    const account = accounts[0]

    const gas = await RemixContract.methods.setMessage(message).estimateGas()
    const result = await RemixContract.methods
      .setMessage(message)
      .send({ from: account, gas })
    console.log(result)
  }

  useEffect(async ()=>{
    getDefaultData()
    const config = await circle.getParams({apiKey})
    console.log(config)
    const ballance = await circle.getBallance({apiKey}) || {}
    if (ballance.data) {
      if (Array.isArray(ballance.data)) {
        setCircleAccountParams(ballance.data[0])
      }
    }
    console.log(ballance)
  },[])

  const handleBidNFT = () => {
    const params = handleFormSubmit()
    if (currentCurrency.toLowerCase() === 'usdt') {
      if (params) {
        const result = circle.sendPayment({apiKey, to: nftRaffleWallet, amount: params.ethamount})
      }
    }
    if (currentCurrency.toLowerCase() === 'eth') {
      setData(params)
    }
  }

  return (
    <div className="App">
      <header className="App-header" style={{minHeight: 80}}>
        NFTRaffle
      </header>
      <div className='main-form' style={{paddingLeft: 20, paddingRight: 20, paddingTop: 10}}>
        <InputGroup className="mb-3">
          <InputGroup.Text id="basic-addon1">user@</InputGroup.Text>
          <FormControl
            placeholder="Username"
            aria-label="Username"
            aria-describedby="basic-addon1"
            value={user}
            onChange={(e)=>setUser(e.target.value)}
          />
        </InputGroup>

        { /* <Form.Label htmlFor="basic-url">Your vanity URL</Form.Label> */ }

        <InputGroup 
          className="mb-3"
          //as="textarea"
          disabled={true}
          onChange={(e)=>console.log(e.target.value)}
        >
          <DropdownButton
            variant="outline-secondary"
            title="Country"
            id="input-group-state"
            onSelect={(val)=>setCurrentCountry(val)}
          >
            
            {countries.map(country=>(
                <Dropdown.Item 
                  eventKey={country.code}
                  key={country.code}
                >{country.name}</Dropdown.Item>
            ))}
          </DropdownButton>
          <FormControl 
              aria-label="Text input with dropdown button"
              value={getCountryName({code : currentCountry})}
              readOnly={true}
          />
        </InputGroup>


      {currentCountry === 'US' &&  <InputGroup 
          className="mb-3"
          value={currentState}
          //as="textarea"
          disabled={true}
          onChange={(e)=>console.log(e.target.value)}
        >
          <DropdownButton
            variant="outline-secondary"
            title="State"
            id="input-group-state"
            onSelect={(val)=>setCurrentState(val)}
          >
            
            {states.map(state=>(
                <Dropdown.Item 
                    eventKey={state.abbreviation}
                    key={state.abbreviation}
                >{state.name}</Dropdown.Item>
            ))}
          </DropdownButton>
          <FormControl 
              aria-label="Text input with dropdown button"
              value={getStateName({code: currentState})}
              readOnly={true}
          />
        </InputGroup> }


        <InputGroup className="mb-3">
          <InputGroup.Text>Number of Tickets</InputGroup.Text>
          <FormControl 
            aria-label="Number of Tickets"
            value={tickets}
            onChange={(e)=>setTickets(e.target.value)}
          />
          {/* <InputGroup.Text>.00</InputGroup.Text> */}
        </InputGroup>

        <InputGroup 
          className="mb-3"
          //as="textarea"
          disabled={true}
          onChange={(e)=>console.log(e.target.value)}
        >
          <DropdownButton
            variant="outline-secondary"
            title="Currency"
            id="input-group-state"
            onSelect={(val)=>setCurrentCurrency(val)}
          >
            
                <Dropdown.Item 
                  eventKey={"ETH"}
                  key={"ETH"}
                >{"ETH"}</Dropdown.Item>

                <Dropdown.Item  
                  eventKey={"USDC"}
                  key={"USDC"}
                >{"USDC"}</Dropdown.Item>
          </DropdownButton>

          <FormControl 
              aria-label="Text input with dropdown button"
              value={currentCurrency}
              readOnly={true}
          />
            {currentCurrency.toLocaleLowerCase() === 'usdc' && <div style={{display: 'flex', alignItems: 'center', paddingLeft: 5, paddingRight: 5, border: '1px solid rgb(195,202,209)	'}}>
            Your Circle Wallet:
            Currency - <b>{circleAccountParams.name}</b>(<b>{circleAccountParams.symbol}</b>), Balance - <b>{circleAccountParams.totalAmount} {circleAccountParams.symbol}</b>
            </div>}
        </InputGroup>

        <InputGroup className="mb-3">
          <InputGroup.Text>{currentCurrency}</InputGroup.Text>
          <FormControl 
            aria-label="Amount in ETH"
            //value={ethA}
            value={getPrice(ticketPrice,tickets,currentCurrency).toFixed(5)}
            //onChange={(e)=>setEthA(e.target.value)}
            disabled={true}
          />
          {/* <InputGroup.Text>.00</InputGroup.Text> */}
        </InputGroup>

        <InputGroup>
          <InputGroup.Text>Additional Notes</InputGroup.Text>
          <FormControl 
            as="textarea"
            aria-label="Additional Notes"
            value={notes}
            onChange={(e)=>setNotes(e.target.value)}
          />
        </InputGroup>
        <InputGroup style={{marginTop: 40}}>
          <Button
            onClick={()=>console.log(handleFormSubmit())}
          >Bid NFT</Button>
        </InputGroup>
      </div>
    </div>
  )
}

export default App
