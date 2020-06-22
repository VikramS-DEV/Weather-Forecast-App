import React, { Component } from 'react';
import {Image,StyleSheet,Text,View, ActivityIndicator,PermissionsAndroid,Platform,ImageBackground,Modal} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import { createBottomTabNavigator, createAppContainer} from 'react-navigation';  
import { createMaterialBottomTabNavigator } from 'react-navigation-material-bottom-tabs';  
import Icon from 'react-native-vector-icons/Ionicons';
import {YellowBox} from 'react-native';
YellowBox.ignoreWarnings(['Warning: ReactNative.createElement']);
console.disableYellowBox = true; 

const API_KEY='406db8b491f50214197e8bf80b53adb6';
const tempdata = [];
let screen2bg;

class App extends React.Component{

constructor(props)
{
  super(props)
  this.state= {
    isloading: true,
    DataSource:null,
    CityData:null,
    city:'Pune',
    currentLongitude: 'unkown',
    currentLatitude: 'unknown',

    WeekDays:[
      {day:'Sun'},
      {day:'Mon'},
      {day:'Tue'},
      {day:'Wed'},
      {day:'Thu'},
      {day:'Fri'},
      {day:'Sat'},
    ],

    Forcast:[
      {day:'Mon',temp:'22.7',icon:''},
      {day:'Mon',temp:'22.7',icon:''},
      {day:'Mon',temp:'22.7',icon:''},
      {day:'Mon',temp:'22.7',icon:''},
      {day:'Mon',temp:'22.7',icon:''},
    ],

  }
}

componentDidMount = () => {
  var that =this;
  //Checking for the permission just after component loaded
  if(Platform.OS === 'ios'){
    this.callLocation(that);
  }else{
    async function requestLocationPermission() {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,{
            'title': 'Location Access Required',
            'message': 'This App needs to Access your location'
          }
        )
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          //To Check, If Permission is granted
          that.callLocation(that);
        } else {
          alert("Permission Denied");
        }
      } catch (err) {
        alert("err",err);
        console.warn(err)
      }
    }
    requestLocationPermission();
  }    
  const { city } = this.state;
  const { currentLongitude } = this.state;
  const { currentLatitude } = this.state;
  console.log("LATITUDE:", currentLatitude)
  console.log("LONGITUDE:", currentLongitude)
 }


 callLocation(that){
  console.log("callLocation Called");
    Geolocation.getCurrentPosition(
      //Will give you the current location
       (position) => {
          const currentLongitude = JSON.stringify(position.coords.longitude);
          //getting the Longitude from the location json
          const currentLatitude = JSON.stringify(position.coords.latitude);
          //getting the Latitude from the location json
        
        
          // To Pass lattitude and longitude to ResponseJson 
          that.setState({ currentLongitude:currentLongitude, currentLatitude:currentLatitude }, ()=>{
            console.log("FUNCTION 1")
            return fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${this.state.currentLatitude}&lon=${this.state.currentLongitude}&units=metric&appid=${API_KEY}`)
            .then( (respone)=>respone.json() )
            .then( (responeJson) =>{
            console.log("Checking 1:",responeJson.list[0].main.temp)
            this.setState({isloading: false, DataSource: responeJson.list})  
            this.setState({isloading: false, CityData: responeJson.city.name})

            tempdata[0]= responeJson.list[0].main.feels_like;
            tempdata[1]= responeJson.list[0].main.temp_min;
            tempdata[2]= responeJson.list[0].main.temp_max;
            tempdata[3]= responeJson.list[0].main.pressure;
            tempdata[4]= responeJson.list[0].main.sea_level;
            tempdata[5]= responeJson.list[0].main.grnd_level;  
            tempdata[6]= responeJson.list[0].main.humidity;
            tempdata[7]= responeJson.list[0].main.temp_kf;
            tempdata[8]= responeJson.list[0].wind.speed;
            tempdata[9]= responeJson.list[0].wind.deg;
            tempdata[10]= responeJson.list[0].weather[0].description;
  
            // for(var i=0;i<tempdata.length;i++)
            // {
            //   console.log("TempData 2:",tempdata[i])
            // }
          }
            )
            .catch( (error)=> 
            {console.log(error);}
            );
          });
          //Setting state Longitude to re re-render the Longitude Text
          //Setting state Latitude to re re-render the Longitude Text
       },
      (error) => (error.message),
       { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    );
    that.watchID = Geolocation.watchPosition((position) => {
      //Will give you the location on location change
        console.log(position);
        const currentLongitude = JSON.stringify(position.coords.longitude);
        //getting the Longitude from the location json
        const currentLatitude = JSON.stringify(position.coords.latitude);
        //getting the Latitude from the location json
        
        
        // To Pass lattitude and longitude to ResponseJson 
        that.setState({ currentLongitude:currentLongitude, currentLatitude:currentLatitude }, ()=>{
          console.log("FUNCTION 2")
          return fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${this.state.currentLatitude}&lon=${this.state.currentLongitude}&units=metric&appid=${API_KEY}`)
          .then( (respone)=>respone.json() )
          .then( (responeJson) =>{
          console.log("Checking 2:",responeJson.list[0].main.temp)
          console.log("Checking Status 2:",responeJson.list[0].weather[0].main)
          console.log("Checking Status 2:",responeJson.city.name)
          console.log("TOMORROW:",responeJson.list[0].dt_txt)
          this.setState({isloading: false, tempdata: responeJson.list[0].main})
            
            // for(var i=0;i<tempdata.length;i++)
            // {
            //   console.log("TempData 1:",tempdata[i])
            // }  

          //For getting next week days from today

          var day = new Date(responeJson.list[0].dt_txt.substr(0,10));  //To get todays Day
          var n = day.getDay()+1;
          var j=6;

          if(n==7)
          n=0;

          for(var i=0;i<5;i++)
          {
            this.state.Forcast[i].day=this.state.WeekDays[n].day;
            this.state.Forcast[i].temp=responeJson.list[j].main.temp;
            this.state.Forcast[i].icon= `http://openweathermap.org/img/wn/${responeJson.list[j].weather[0].icon}@2x.png`;
            j=j+8;
            n++;

            if(n==7)
            n=0;
          } 

          this.setState({ DataSource: responeJson.list}, ()=>{this.setState({isloading:false})})  
          this.setState({ CityData: responeJson.city.name}) 
          
          
          //Tempture Details
          tempdata[0]= responeJson.list[0].main.feels_like;
          tempdata[1]= responeJson.list[0].main.temp_min;
          tempdata[2]= responeJson.list[0].main.temp_max;
          tempdata[3]= responeJson.list[0].main.pressure;
          tempdata[4]= responeJson.list[0].main.sea_level;
          tempdata[5]= responeJson.list[0].main.grnd_level;  
          tempdata[6]= responeJson.list[0].main.humidity;
          tempdata[7]= responeJson.list[0].main.temp_kf;
          tempdata[8]= responeJson.list[0].wind.speed;
          tempdata[9]= responeJson.list[0].wind.deg;
          tempdata[10]= responeJson.list[0].weather[0].description;

          // for(var i=0;i<tempdata.length;i++)
          // {
          //   console.log("TempData 2:",tempdata[i])
          // }  
        }
          )
          .catch( (error)=> 
          {console.log(error);}
          );
        });
       //Setting state Latitude to re re-render the Longitude Text
    });
 }
 componentWillUnmount = () => {
    Geolocation.clearWatch(this.watchID);
 }


  render()
  {

    if(this.state.isloading)
    {
      return(
      //   <View style = {{justifyContent: 'center',flex: 1, backgroundColor: 'rgb(54, 53, 50)'}}>
      //   <ActivityIndicator />
      //   <Text style ={{ color:'rgb(255, 255, 255)',fontSize: 40,fontFamily: 'Merienda-Bold',textAlign:'center'}}>Laoding..</Text>
      // </View>
      <Modal
        animationType="slide"
        transparent={false}
        visible={true}
         style={{backgroundColor:'rgb(0,172,230)'}}
        onRequestClose={() => {
          Alert.alert("Modal has been closed.");
        }}
      >
     <ImageBackground style= {{justifyContent:'center',width:'100%',height:'100%', backgroundColor:'white'}} source={require('./images/loadingbg.jpg')}>
     <View style={{justifyContent:'center',alignItems:'center',justifyContent:'center'}}>
     <Text style = {{color:'#FFFFFF',fontFamily:'Merienda-Bold',fontSize:40,paddingBottom:125}}>Weather App</Text> 
     </View>
     </ImageBackground>
      </Modal>
      )

    }
    else if(this.state.DataSource!==null)
    {
      let backimage;
      console.log("Image Upload: ",this.state.DataSource[0].weather[0].main)
      if(this.state.DataSource[0].weather[0].main=="Rain")
      backimage= require('./images/rain2.jpg');
      else if(this.state.DataSource[0].weather[0].main=="Thunderstorm")
      backimage= require('./images/thunder.jpg');
      else if(this.state.DataSource[0].weather[0].main=="Drizzle")
      backimage= require('./images/drizzle.jpg');
      else if(this.state.DataSource[0].weather[0].main=="Snow")
      backimage= require('./images/snow.jpg');
      else if(this.state.DataSource[0].weather[0].main=="Clear")
      backimage= require('./images/clearsky.jpg');
      else if(this.state.DataSource[0].weather[0].main=="Clouds")
      backimage= require('./images/cloudy.jpg');
      else
      backimage= require('./images/black.jpg')
      screen2bg = backimage;

      console.log("TEMP",this.state.DataSource[0].main.temp)

    return(
      <ImageBackground style= {{width:'100%', justifyContent:'space-evenly', alignItems:'center', height:'100%', backgroundColor:'white'}} source={backimage}>

      {
        console.log("In return:", this.state.DataSource) ||
        this.state.DataSource!==null ? (
          <>
          <View style={{justifyContent:'center',alignItems:'center'}}>
        
        <Text style = {{color:'#FFFFFF',fontFamily:'Merienda-Regular',fontSize:35,paddingBottom:30}}>{this.state.DataSource[0].main.temp}°C</Text>
        <Text style = {{color:'#FFFFFF',fontFamily:'Merienda-Regular',fontSize:35,paddingBottom:20}}>{this.state.DataSource[0].weather[0].main}</Text>
        <Text style = {{color:'#FFFFFF',fontFamily:'Merienda-Regular',fontSize:25}}>{this.state.CityData}</Text>

      </View>
     
    <View style={{width:'100%', padding:10,}}>

      <View style = {{width:'100%', padding:20, backgroundColor:'rgba(133,133,133,0.5)',borderRadius:15,flexDirection:'row', justifyContent:'space-evenly', alignItems:'center'}}>
      {
        this.state.Forcast.map((data, index) => (
          <View style={{justifyContent:'center', alignItems:'center'}} key={index}>
            <Text style= {{color:'#FFFFFF',fontFamily:'Merienda-Regular',fontSize:15}}>{data.day}</Text>
            <Text style = {{color:'#FFFFFF',fontFamily:'Merienda-Regular',fontSize:15} }>{data.temp}</Text>
               <Image source={{uri:data.icon}} style={{width:50, height:50}}/> 
          </View>
        ))
      }
      
      </View>
      
    </View>
          </>

        ) : (
          <Text style={{color:'#FFFFFF'}}>Loading...</Text>
        )
      }
      

      </ImageBackground>
      
    )
  }
  else{
    return(
      <Text>Loading ...</Text>
    )
  }
}
}

class WeatherDetails extends Component{

  render()
  {
    return(
      <ImageBackground style= {{width:'100%', justifyContent:'space-evenly', alignItems:'center', height:'100%', backgroundColor:'white'}} source={screen2bg}>
     
        <View style={{width:'100%', padding:10}}>

          <Text style = {styles.detailHead}>Weather Description</Text>
          <View style = {{width:'100%', padding:10, backgroundColor:'rgba(133,133,133,0.5)',borderRadius:15, justifyContent:'space-evenly',alignItems: 'center'}}>
          <Text style = {styles.detailtext}>{tempdata[10]}</Text>
          </View>

          <View style = {{marginTop:30}}>
          <Text style = {styles.detailHead}>Temperature</Text>
          </View>

          <View style = {{width:'100%', padding:10, backgroundColor:'rgba(133,133,133,0.5)',borderRadius:15, justifyContent:'space-evenly',alignItems: 'center'}}>
          <Text style = {styles.detailtext}>Temperature Perception :  {tempdata[0]} °C</Text>
          <Text style = {styles.detailtext}>Minimum Temperature:   {tempdata[1]}  °C</Text>
          <Text style = {styles.detailtext}>Max Temperature:   {tempdata[2]}  °C</Text>
          </View>

          <View style = {{marginTop:30}}>
          <Text style = {styles.detailHead}>Atmosphere</Text>
          </View>

          <View style = {{width:'100%', padding:10, backgroundColor:'rgba(133,133,133,0.5)',borderRadius:15, justifyContent:'space-evenly', alignItems:'center'}}>
          <Text style = {styles.detailtext}>Pressure:   {tempdata[3]} hPa</Text>
          <Text style = {styles.detailtext}>Sea Level:   {tempdata[4]} hPa</Text>
          <Text style = {styles.detailtext}>Ground Level:   {tempdata[5]}hPa</Text>
          <Text style = {styles.detailtext}>Humidty:   {tempdata[6]}%</Text>
          </View>           
       
          <View style = {{marginTop:30}}>
          <Text style = {styles.detailHead}>Wind</Text>
          </View>

          <View style = {{width:'100%', padding:10, backgroundColor:'rgba(133,133,133,0.5)',borderRadius:15, justifyContent:'space-evenly', alignItems:'center'}}>
          <Text style = {styles.detailtext}>Speed:   {tempdata[8]}  m/s</Text>
          <Text style = {styles.detailtext}>Direction:   {tempdata[9]}°</Text>
          </View>

        </View>

      </ImageBackground>
    );
  }
}


export default createMaterialBottomTabNavigator(  
  {  
      Home: { screen: App,  
          navigationOptions:{  
              tabBarLabel:'Home',  
              tabBarIcon: ({ tintColor }) => (  
                  <View>  
                      <Icon style={[{color: tintColor}]} size={25} name={'ios-home'}/>  
                  </View>),  
          }  
      },  
      Details: { screen: WeatherDetails,  
          navigationOptions:{  
              tabBarLabel:'Details',  
              tabBarIcon: ({ tintColor }) => (  
                  <View>  
                      <Icon style={[{color: tintColor}]} size={25} name={'ios-list'}/>  
                  </View>),  
              activeColor: '#f60c0d',  
              inactiveColor: '#f65a22',  
              barStyle: { backgroundColor: 'rgb(255,255,255)' },  
          }  
      },   
  },  
  {  
    initialRouteName: "Home",  
    swipeEnabled: true,
    animationEnabled: true,
    activeColor: '#f0edf6',  
    inactiveColor: '#226557',  
    barStyle: { backgroundColor: 'rgb(255,255,255)' },  
  },  
);  




const styles = StyleSheet.create({

detailtext:{
  color:'#FFFFFF',
  fontFamily:'Merienda-Regular',
  fontSize:15
},
detailHead:{
  color:'#FFFFFF',
  fontFamily:'Merienda-Bold',
  fontSize:20
},
});