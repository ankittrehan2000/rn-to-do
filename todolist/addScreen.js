import * as React from 'react';
import {
  View,
  Text,
  Button,
  TextInput,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import * as SQLite from 'expo-sqlite';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons, AntDesign } from '@expo/vector-icons';
import { 
  useFonts,
  Pangolin_400Regular 
} from '@expo-google-fonts/pangolin';

const db = SQLite.openDatabase('Todos');

export default function AddScreen({ navigation }) {
  //keep remind me disabled until time is picked or else there will be an error
  const [task, setTask] = React.useState('');
  const [subTasks, setSubTasks] = React.useState('');
  const [category, setCategory] = React.useState('');
  const [date, setDate] = React.useState(
    new Date().toLocaleDateString('en-US')
  );
  const [time, setTime] = React.useState(
    new Date().getTime() - new Date().getTimezoneOffset() * 60 * 1000
  );
  const [showTime, setShowTime] = React.useState(new Date());
  const [showDate, setShowDate] = React.useState(new Date());
  const [dateModal, setDateModal] = React.useState(false);
  const [timeModal, setTimeModal] = React.useState(false);
  let [fontsLoaded] = useFonts({Pangolin_400Regular})

  const add = () => {
    db.transaction(async (tx) => {
      await tx.executeSql(
        'Insert into todo(value, done, date_for, category, time, sub_tasks) values ( ? , ? , ?, ?, ?, ?)',
        [task, false, date, category, time, subTasks]
      );
    });
  };

  if (!fontsLoaded) {
    return <Text>Loading...</Text>;
  } else {
  return (
    <View style={styles.container}>
      <View style={styles.containerOfThis}>
        <SafeAreaView styl={styles.actContainer}>
          <Ionicons
            name="chevron-back"
            size={25}
            color="blue"
            style={styles.topBack}
            onPress={() => navigation.goBack()}
          />
          <Text style={styles.appBarText}>Add a task</Text>
          <View style={styles.textAndInp}>
            <Text style={styles.topText}>Task:</Text>
            <TextInput
              style={styles.taskInput}
              onChangeText={(text) => setTask(text)}
              value={task}
            />
          </View>
          <View style={styles.textAndInp}>
            <Text style={styles.topText}>Description:</Text>
            <TextInput
              style={styles.taskInput}
              onChangeText={(text) => setSubTasks(text)}
              value={subTasks}
            />
          </View>
          <View style={styles.textAndInp}>
            <Text style={styles.topText}>Category:</Text>
            <TextInput
              style={styles.taskInput}
              onChangeText={(text) => setCategory(text)}
              value={category}
            />
          </View>
          <View
            style={{
              justifyContent: 'center',
              flexDirection: 'column',
              display: 'flex',
              height: '20%',
              marginVertical: '7%',
            }}>
            <View
              style={[
                styles.dateTime,
                {
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                },
              ]}>
              <Text style={styles.topText}>Date:</Text>
              <Text style={styles.topText}>
                {showDate.toLocaleDateString()}
              </Text>
              <TouchableOpacity
                onPress={() => setDateModal(true)}
                style={{ display: 'flex', flexDirection: 'row' }}>
                <Text style={[styles.topText, {fontFamily: 'Pangolin_400Regular'}]}>Set</Text>
                <AntDesign
                  name="arrowright"
                  size={25}
                  color="blue"
                  style={{ marginRight: '1%' }}
                />
              </TouchableOpacity>
            </View>
            <View
              style={[
                styles.dateTime,
                {
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                },
              ]}>
              <Text style={styles.topText}>Time:</Text>
              <Text style={styles.topText}>
                {msToTime(
                  showTime - new Date().getTimezoneOffset() * 60 * 1000
                )}
              </Text>
              <TouchableOpacity
                onPress={() => setTimeModal(true)}
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}>
                <Text style={[styles.topText, {fontFamily: 'Pangolin_400Regular'}]}>Set</Text>
                <AntDesign
                  name="arrowright"
                  size={25}
                  color="blue"
                  style={{ marginRight: '1%' }}
                />
              </TouchableOpacity>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.saveBtn, task == '' ? { opacity: 0.2 } : {}]}
            disabled={task == '' ? true : false}
            onPress={() => {
              add();
              navigation.goBack();
            }}>
            <Text style={[styles.topText, { color: 'white' }]}>Save</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </View>
      <Modal animationType="slide" transparent={true} visible={dateModal}>
        <View
          style={{
            alignSelf: 'center',
            opacity: 0.93,
            backgroundColor: 'black',
            width: '100%',
            height: '100%',
          }}>
          <View
            style={{
              alignItems: 'center',
              top: '25%',
              width: '80%',
              height: '50%',
              backgroundColor: 'blue',
              borderRadius: 15,
              left: '10%',
            }}>
            <DateTimePicker
              textColor="white"
              mode="date"
              display="spinner"
              value={showDate}
              style={{ height: '80%', width: '90%', color: 'white' }}
              onChange={(e, eventDate) => {
                setShowDate(eventDate);
                setDate(eventDate.toLocaleDateString('en-US'));
              }}
            />
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-around',
                width: '100%',
              }}>
              <TouchableOpacity
                onPress={async () => {
                  setDateModal(false);
                }}
                style={{
                  backgroundColor: 'white',
                  padding: '5%',
                  borderRadius: 20,
                }}>
                <Text
                  style={{
                    color: 'blue',
                    fontSize: 18,
                    fontWeight: 'bold',
                  }}>
                  Save
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Modal animationType="slide" transparent={true} visible={timeModal} style={{flex: 1}}>
        <View
          style={{
            alignSelf: 'center',
            opacity: 0.93,
            backgroundColor: 'black',
            width: '100%',
            height: '100%',
          }}>
          <View
            style={{
              alignItems: 'center',
              top: '25%',
              width: '80%',
              height: '50%',
              backgroundColor: 'blue',
              borderRadius: 15,
              left: '10%',
            }}>
            <DateTimePicker
              textColor="white"
              mode="time"
              display="spinner"
              value={showTime}
              style={{ height: '80%', width: '90%', color: 'white' }}
              onChange={(event, evtime) => {
                setShowTime(evtime);
                setTime(
                  evtime.getTime() - new Date().getTimezoneOffset() * 60 * 1000
                );
              }}
            />
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-around',
                width: '100%',
              }}>
              <TouchableOpacity
                onPress={() => setTimeModal(false)}
                style={{
                  backgroundColor: 'white',
                  padding: '5%',
                  borderRadius: 20,
                }}>
                <Text
                  style={{
                    color: 'blue',
                    fontSize: 18,
                    fontWeight: 'bold',
                  }}>
                  Save
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );}
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'blue'
  },
  topText: {
    fontWeight: 'bold',
    fontSize: 18,
    color: 'blue',
    letterSpacing: 1.3,
  },
  actContainer: {
    width: '100%',
    paddingHorizontal: '5%',
  },
  taskInput: {
    width: '100%',
    height: '90%',
    borderBottomColor: 'blue',
    borderTopColor: 'white',
    borderRightColor: 'white',
    borderLeftColor: 'white',
    borderWidth: 2,
    fontSize: 20,
    paddingHorizontal: 10,
    paddingBottom: 0,
    marginTop: '3%',
    fontFamily: 'Pangolin_400Regular'
  },
  textAndInp: {
    flexDirection: 'column',
    marginHorizontal: '2%',
    height: '11%',
    justifyContent: 'flex-start',
    alignContent: 'flex-start',
    alignItems: 'flex-start',
    marginVertical: '5%',
    paddingHorizontal: '5%',
  },
  containerOfThis: {
    backgroundColor: 'white',
    borderBottomLeftRadius: 70,
    borderBottomRightRadius: 70,
    justifyContent: 'center',
    alignContent: 'center',
  },
  dateTime: {
    marginHorizontal: '5%',
    marginVertical: '5%',
    paddingHorizontal: '5%',
  },
  saveBtn: {
    height: '10%',
    width: '30%',
    borderRadius: 15,
    alignSelf: 'center',
    backgroundColor: 'blue',
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
    marginBottom: -15,
    marginTop: '1%',
  },
  appBarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'blue',
    alignSelf: 'center',
    marginBottom: '3%',
  },
  topBack: {
    position: 'absolute',
    top: '0%',
    left: '5%',
  },
});

function msToTime(duration) {
  var minutes = Math.floor((duration / (1000 * 60)) % 60),
    hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

  hours = hours < 10 ? '0' + hours : hours;
  minutes = minutes < 10 ? '0' + minutes : minutes;

  return hours + ':' + minutes;
}
