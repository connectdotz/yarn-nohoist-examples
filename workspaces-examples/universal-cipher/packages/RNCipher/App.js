/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from "react";
import { Alert, Platform, StyleSheet, Text, View, Button, TextInput } from "react-native";
import { encrypt, decrypt } from "cipher-core";

const instructions = Platform.select({
  ios: "Press Cmd+R to reload,\n" + "Cmd+D or shake for dev menu",
  android: "Double tap R on your keyboard to reload,\n" + "Shake or press menu button for dev menu"
});

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = { input: undefined, encrypted: undefined, decrypted: undefined };
  }
  render() {
    return (
      <View style={styles.root}>
        <View style={styles.container}>
          <Text style={styles.welcome}>Demo: Simple Cipher</Text>
          <TextInput
            style={styles.inputField}
            placeholder="enter text to encrypt"
            returnKeyType="done"
            enablesReturnKeyAutomatically={false}
            autoFocus={true}
            multiline={true}
            value={this.state.input || ""}
            onChangeText={this._textChanged}
          />
          <Button title="encrypt" onPress={this._encrypt} />
          {this._showDecryptView()}
        </View>
        <View style={styles.container}>
          <Text style={styles.instructions}>To get started, edit App.js</Text>
          <Text style={styles.instructions}>{instructions}</Text>
        </View>
      </View>
    );
  }
  _showDecryptView = () => {
    if (!this.state.encrypted) return null;
    console.log(`this.state.encrypted=`, this.state.encrypted);

    return (
      <View>
        <Text>
          Encrypted: <Text style={styles.encrypted}>{this.state.encrypted.content}</Text>
        </Text>
        <Button title="decrypt" onPress={this._decrypt} />
        {this._showDecryptResult()}
      </View>
    );
  };
  _showDecryptResult = () => {
    if (!this.state.decrypted) return null;
    return <Text>Decrypted: {this.state.decrypted}</Text>;
  };
  _textChanged = t => {
    this.setState({ input: t, encrypted: undefined, decrypted: undefined });
  };
  _encrypt = () => {
    if (!this.state.input) {
      Alert.alert("No Text", "please enter text to encrypt");
      return;
    }
    const encrypted = encrypt(this.state.input);
    this.setState({ encrypted });
  };
  _decrypt = () => {
    if (!this.state.encrypted) {
      Alert.alert("No Encrypted Text", "please encrypt some text first");
      return;
    }
    const decrypted = decrypt(this.state.encrypted);
    this.setState({ decrypted });
  };
  _reset = () => {
    this.setState({ input: undefined, encrypted: undefined, decrypted: undefined });
  };
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "stretch",
    backgroundColor: "white",
    paddingVertical: 20,
    paddingHorizontal: 8
  },
  container: {
    flex: -1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5FCFF",
    margin: 8,
    padding: 8
  },
  inputField: {
    borderColor: "#D9E3F0",
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: "white",
    padding: 8
  },
  welcome: {
    fontSize: 20,
    textAlign: "center",
    margin: 10
  },
  instructions: {
    textAlign: "center",
    color: "#333333",
    marginBottom: 5
  },
  encrypted: {
    fontSize: 11,
    color: "#333333"
  }
});
