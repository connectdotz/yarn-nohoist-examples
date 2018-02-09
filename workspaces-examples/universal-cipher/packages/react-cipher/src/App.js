import React, { Component } from "react";
// import logo from "./logo.svg";
import "./App.css";
import { encrypt, decrypt } from "cipher-core";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      input: undefined,
      encrypted: undefined,
      decrypted: undefined
    };
  }
  render() {
    return (
      <div className="root">
        <div className="container">
          <p className="welcome">Demo: Simple Cipher</p>
          <textarea
            type="text"
            name="input"
            className="inputField"
            placeholder="enter text to encrypt"
            value={this.state.input || ""}
            onChange={this._textChanged}
          />
          <button className="button" onClick={this._encrypt}>
            encrypt
          </button>
          {this._showDecryptView()}
        </div>
      </div>
    );
    // return (
    //   <div className="App">
    //     <header className="App-header">
    //       <img src={logo} className="App-logo" alt="logo" />
    //       <h1 className="App-title">Welcome to React</h1>
    //     </header>
    //     <p className="App-intro">
    //       To get started, edit <code>src/App.js</code> and save to reload.
    //     </p>
    //   </div>
  }

  _showDecryptView = () => {
    if (!this.state.encrypted) return null;
    console.log(`this.state.encrypted=`, this.state.encrypted);

    return (
      <div>
        <p>
          Encrypted: <span className="encrypted">{this.state.encrypted.content}</span>
        </p>
        <button className="button" onClick={this._decrypt}>
          decrypt
        </button>
        {this._showDecryptResult()}
      </div>
    );
  };
  _showDecryptResult = () => {
    if (!this.state.decrypted) return null;
    return <p>Decrypted: {this.state.decrypted}</p>;
  };
  _textChanged = event => {
    this.setState({ input: event.target.value, encrypted: undefined, decrypted: undefined });
  };
  _encrypt = () => {
    if (!this.state.input) {
      console.warn("No p", "please enter text to encrypt");
      return;
    }
    const encrypted = encrypt(this.state.input);
    this.setState({ encrypted });
  };
  _decrypt = () => {
    if (!this.state.encrypted) {
      console.warn("No Encrypted p", "please encrypt some text first");
      return;
    }
    const decrypted = decrypt(this.state.encrypted);
    this.setState({ decrypted });
  };
  _reset = () => {
    this.setState({ input: undefined, encrypted: undefined, decrypted: undefined });
  };
}

export default App;
