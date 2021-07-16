import * as React from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  Button,
  ScrollView,
  Modal,
  AsyncStorage,
} from 'react-native';
import Constants from 'expo-constants';
import { Ionicons, Entypo } from '@expo/vector-icons';
import * as SQLite from 'expo-sqlite';
import { Checkbox } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useIsFocused } from '@react-navigation/native';
import { AppLoading } from 'expo-app-loading';
import { useFonts, Pangolin_400Regular } from '@expo-google-fonts/pangolin';

const db = SQLite.openDatabase('Todos');
db.transaction(async (tx) => {
  await tx.executeSql(
    'CREATE TABLE IF NOT EXISTS todo(id INTEGER PRIMARY KEY NOT NULL, value TEXT, done BOOLEAN, time BIGINT, date_for DATE, sub_tasks TEXT, category TEXT)',
    [],
    (tx) => {
      console.log('created');
    }
  );
});

function completedTask(array) {
  let counter = 0;
  for (let i = 0; i < array.length; i++) {
    if (array[i].done == 1) counter += 1;
  }
  return counter;
}

export default function HomePage({ navigation }) {
  const [checked, setChecked] = React.useState(false);
  const [date, setDate] = React.useState(new Date());
  const [taskArray, setTaskArray] = React.useState([]);
  const isFocused = useIsFocused();
  const [reRender, setReRender] = React.useState(false);
  const [modal, setModal] = React.useState(false);
  const [numtasks, setNumTasks] = React.useState(0);
  const [todayTasks, setTodayTasks] = React.useState(0);
  const [name, setName] = React.useState('Name');
  const [showdate, setShowDate] = React.useState(
    new Date().toLocaleDateString()
  );
  const [todayTask, setTodayTask] = React.useState(0);
  const [dateTask, setDateTask] = React.useState(0);
  let [fontsLoaded] = useFonts({ Pangolin_400Regular });

  const updateSomething = (id) => {
    db.transaction(async (tx) => {
      await tx.executeSql(
        'update todo set done = (case when done = 0 then 1 else 0 end) where id = ?;',
        [id],
        (text, val) => {
          setReRender(!reRender);
        },
        (err, val) => console.log(err)
      );
    });
  };

  const _retrieveData = async () => {
    try {
      const value = await AsyncStorage.getItem('Name');
      if (value !== null) {
        // We have data!!
        setName(value);
      }
    } catch (error) {
      // Error retrieving data
      setName('Name');
    }
  };

  React.useEffect(() => {
    _retrieveData();
    db.transaction(async (tx) => {
      await tx.executeSql(
        'SELECT * FROM todo where date_for = ? order by time ASC',
        [date.toLocaleDateString('en-US')],
        (textObj, { rows: _array }) => {
          setTaskArray(_array._array);
          if (date.toLocaleDateString() == new Date().toLocaleDateString())
            setTodayTask(completedTask(_array._array));
          setDateTask(completedTask(_array._array));
          setNumTasks(_array.length);
          if (
            date.toLocaleDateString('en-US') ==
            new Date().toLocaleDateString('en-US')
          )
            setTodayTasks(_array.length);
        },
        (txObj, error) => console.log('Error ', error)
      );
    });
  }, [date, isFocused, reRender, name, todayTask]);

  if (!fontsLoaded) {
    return <Text>Loading...</Text>;
  } else {
    return (
      <View style={styles.container}>
        <SafeAreaView />
        <Modal animationType="slide" transparent={true} visible={modal}>
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
                value={date}
                display="spinner"
                mode="date"
                style={{ height: '80%', width: '90%', color: 'white' }}
                onChange={(event, evdate) => {
                  setDate(evdate);
                  setShowDate(evdate.toLocaleDateString());
                }}
              />
              <TouchableOpacity
                onPress={() => setModal(false)}
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
                  Select
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        <View style={styles.appBar}>
          <View>
            <Text style={[styles.appName, { fontSize: 10 }]}>
              {todayTask}/{todayTasks}
            </Text>
            <Text style={[styles.appName, { fontSize: 10 }]}>Today</Text>
          </View>
          <Text style={styles.appName}>App To do</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
            <Ionicons name="md-options" size={20} color="white" />
          </TouchableOpacity>
        </View>
        <View style={styles.secondContainer}>
          <View>
            <Text style={styles.secondText}>Hey {name}</Text>
            <Text style={styles.numTasks}>Your Tasks</Text>
          </View>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => setModal(true)}>
            <Text style={styles.addText}>Pick Date</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.bottomContainer}>
          <View
            style={{
              flex: 0.2,
              marginLeft: '10%',
              marginTop: '15%',
              flexDirection: 'row',
            }}>
            <View style={styles.date}>
              <Text style={styles.dateText}>
                {dateTask}/{numtasks}
              </Text>
            </View>
            <View
              style={{ flexDirection: 'column', justifyContent: 'flex-start' }}>
              <Text
                style={[
                  styles.dateText,
                  {
                    color: 'blue',
                    alignSelf: 'flex-start',
                    marginLeft: '5%',
                    marginTop: '2%',
                  },
                ]}>
                Tasks Completed
              </Text>
              <Text
                style={[
                  styles.dateText,
                  {
                    color: 'blue',
                    fontSize: 12,
                    fontWeight: '400',
                    marginLeft: '5%',
                    alignSelf: 'flex-start',
                  },
                ]}>
                for {showdate}
              </Text>
            </View>
          </View>
          <ScrollView style={styles.listContainer}>
            {taskArray != [] &&
              taskArray.map((task, idx) => {
                return (
                  <View
                    key={idx}
                    style={[
                      styles.listTile,
                      task.done == 1 ? { backgroundColor: 'white' } : '',
                    ]}>
                    <View
                      style={{
                        backgroundColor: 'white',
                        marginLeft: '3%',
                        borderRadius: 10,
                      }}>
                      <Checkbox
                        status={task.done == 0 ? 'unchecked' : 'checked'}
                        onPress={() => updateSomething(task.id)}
                      />
                    </View>
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.listHeading,
                        task.done == 1
                          ? { textDecorationLine: 'line-through' }
                          : '',
                      ]}>
                      {task.value}
                    </Text>
                    {task.done == 0 && (
                      <TouchableOpacity
                        style={{ marginLeft: 1, marginRight: 4 }}
                        onPress={() =>
                          navigation.navigate('Edit', {
                            date: date.toLocaleDateString('en-US'),
                            id: task.id,
                          })
                        }>
                        <Entypo
                          name="chevron-small-right"
                          size={30}
                          color="blue"
                        />
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })}
            <View style={{ height: 100 }} />
          </ScrollView>
          {numtasks == 0 && (
            <Text
              style={{
                alignSelf: 'center',
                color: 'grey',
                position: 'absolute',
                bottom: '50%',
              }}>
              Start adding tasks for them to be shown here
            </Text>
          )}
          <TouchableOpacity
            onPress={() => navigation.navigate('Add')}
            style={styles.fabContainer}>
            <Text style={styles.fabPlus}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  appBar: {
    backgroundColor: 'blue',
    flex: 1.5,
    flexDirection: 'row',
    padding: '1%',
    justifyContent: 'space-around',
  },
  listContainer: {
    flex: 2,
    marginLeft: '7%',
  },
  appName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  container: {
    backgroundColor: 'blue',
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between'
  },
  bottomContainer: {
    bottom: 0,
    right: 0,
    flex: 10,
    backgroundColor: 'white',
    borderTopRightRadius: 70,
    borderTopLeftRadius: 70,
  },
  addBtn: {
    width: 100,
    height: 50,
    backgroundColor: 'white',
    color: 'white',
    borderRadius: 15,
    justifyContent: 'center',
  },
  addText: {
    alignSelf: 'center',
    color: 'blue',
    fontWeight: '700',
    elevation: 9,
  },
  secondContainer: {
    flex: 2,
    justifyContent: 'space-between',
    marginLeft: '10%',
    marginRight: '10%',
    flexDirection: 'row',
  },
  secondText: {
    fontWeight: 'bold',
    fontSize: 22,
    letterSpacing: 1.1,
    color: 'white',
    fontFamily: 'Pangolin_400Regular',
  },
  numTasks: {
    fontSize: 18,
    marginTop: 5,
    fontWeight: '400',
    color: 'white',
  },
  fabContainer: {
    position: 'absolute',
    height: 50,
    width: 50,
    alignItems: 'center',
    right: 20,
    bottom: 30,
    justifyContent: 'center',
    backgroundColor: 'blue',
    borderRadius: 20,
  },
  date: {
    width: '30%',
    height: '60%',
    backgroundColor: 'blue',
    borderRadius: 15,
    justifyContent: 'space-around',
  },
  dateText: {
    fontSize: 18,
    alignSelf: 'center',
    color: 'white',
    fontWeight: '700',
  },
  fabPlus: {
    fontSize: 30,
    bottom: 1,
    fontWeight: 'bold',
    color: 'white',
  },
  listTile: {
    width: '85%',
    borderRadius: 15,
    marginBottom: 5,
    alignItems: 'center',
    marginLeft: '5%',
    height: 50,
    marginTop: 10,
    backgroundColor: '#c4d6ff',
    flexDirection: 'row',
  },
  listHeading: {
    fontSize: 20,
    letterSpacing: 1.1,
    marginLeft: 5,
    flex: 1,
    paddingLeft: '3%',
    fontFamily: 'Pangolin_400Regular',
  },
});
