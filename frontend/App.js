import React, { useState, useEffect } from "react";
import { SafeAreaView, StyleSheet, TextInput, Button, Alert, TouchableOpacity, Text, View, Image } from "react-native";
import SelectDropdown from "react-native-select-dropdown";
import { Feather } from '@expo/vector-icons';
import logo from './assets/logo.png';

const UselessTextInput = () => {
    const urlGET = 'http://<your ip4v address>:5000/get_location_names';
    const urlPOST = "http://<your ip4v address>:5000/predict_home_price";
    const [area, setArea] = useState('')
    const [location, setLocation] = useState('')
    const [bath, setBath] = useState(0)
    const [bhk, setBhk] = useState(0)
    const [locationArray, setLocationArray] = useState([])
    const [price, setPrice] = useState('')
    const countries = ["Egypt", "Canada", "Australia", "Ireland"]

    const handleGET = () => {
        fetch(urlGET, { method: 'GET' })
            .then((response) => response.json())
            .then((data) => {
                console.log(data.locations)
                setLocationArray(data.locations)
            })
            .catch((error) => {
                console.error(error);
            });
    }

    useEffect(() => {
        handleGET()
    }, [])

    const handlePOST = () => {
        const data = {
            location: location,
            total_sqft: parseFloat(area),
            bhk: parseInt(bhk),
            bath: parseInt(bath)
        }

        console.log(data)

        fetch(urlPOST, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
            .then((response) => response.json())
            .then((data) => {
                Alert.alert(`Predicted price for the property is: ${data.estimated_price} Lakhs`);
            });
    };

    return (
        <SafeAreaView style={{ justifyContent: 'space-between', height: '98%', paddingVertical: 40 }}>
            <View style={styles.header}>
                <Text style={styles.heading}>Real Estate</Text>
                <Text style={styles.subHeading}>Price Predictor</Text>
                <Text style={{ color: 'grey', justifyContent: 'center', alignItems: 'center', alignContent: 'center' }}><Feather name="map-pin" size={15} color="#387cf2" /> Bangalore</Text>
            </View>
            <View style={{ justifyContent: 'space-between', height: '100%', paddingVertical: 40 }}>
                <View style={styles.txtContainer}>
                    <View style={{ borderWidth: 2, borderColor: '#a1a1a1', width: '90%', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0', marginVertical: 10, borderRadius: 50 }}>
                        <TextInput style={styles.input}
                            onChangeText={e => setArea(e)}
                            placeholder="Enter Area (sqft)"
                            value={area}
                        />
                    </View>
                    <SelectDropdown
                        data={locationArray}
                        buttonStyle={{ width: '90%', borderRadius: 50, borderWidth: 2, borderColor: '#a1a1a1', height: 55 }}
                        dropdownStyle={{ height: '50%', width: '90%', borderRadius: 50 }}
                        onSelect={(selectedItem, index) => {
                            setLocation(selectedItem)
                            console.log(selectedItem, index)
                        }}
                        defaultButtonText="Select Location (Dropdown)"
                        buttonTextStyle={{ fontSize: 14, color: '#a1a1a1' }}
                        buttonTextAfterSelection={(selectedItem, index) => {
                            // text represented after item is selected
                            // if data array is an array of objects then return selectedItem.property to render after item is selected
                            return selectedItem
                        }}
                        rowTextForSelection={(item, index) => {
                            // text represented for each item in dropdown
                            // if data array is an array of objects then return item.property to represent item in dropdown
                            return item
                        }}
                    />
                    <View style={{ borderWidth: 2, borderColor: '#a1a1a1', width: '90%', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0', marginVertical: 10, borderRadius: 50 }}>
                        <TextInput style={styles.input}
                            onChangeText={e => setBath(e)}
                            placeholder="Enter number of Bathrooms"
                            value={bath}
                        />
                    </View>
                    <View style={{ borderWidth: 2, borderColor: '#a1a1a1', width: '90%', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0', marginVertical: 0, borderRadius: 50 }}>
                        <TextInput style={styles.input}
                            onChangeText={e => setBhk(e)}
                            placeholder="Enter BHK"
                            value={bhk}
                        />
                    </View>
                </View>
                <View style={{ alignSelf: 'center', position: 'absolute', top: 300 }}>
                    <Image style={{ height: 300, width: 300, opacity: 0.5 }} source={require('./assets/logo.png')} />
                </View>
                <View style={styles.btnContainer}>
                    <TouchableOpacity style={styles.button}
                        onPress={() => handlePOST()} >
                        <Text style={{ color: 'white', fontWeight: '900', fontSize: 15 }}>Predict Price</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    txtContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    input: {
        height: 40,
        marginVertical: 12,
        borderWidth: 1,
        textAlign: 'center',
        height: 30,
        borderWidth: 0,
        width: '50%',
        color: '#a1a1a1'
    },
    button: {
        backgroundColor: '#6ba1ff',
        height: 40,
        marginVertical: 12,
        width: '90%',
        borderWidth: 2,
        padding: 10,
        alignItems: 'center',
        borderColor: '#387cf2',
        borderRadius: 50,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center'
    },
    btnContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        bottom: 0,
    },
    header: {
        marginHorizontal: 20
    },
    heading: {
        color: '#387cf2',
        fontWeight: '700',
        fontSize: 30,
        letterSpacing: -1
    },
    subHeading: {
        color: '#387cf2',
        marginTop: -10,
        fontWeight: '900',
        fontSize: 40,
        letterSpacing: -2
    },
});

export default UselessTextInput;
