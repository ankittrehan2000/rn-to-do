import {
  View,
  Text,
  TextInput,
  SafeAreaView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import * as React from 'react';
import * as SQLite from 'expo-sqlite';
import { Ionicons } from '@expo/vector-icons';
import { 
  useFonts,
  Pangolin_400Regular 
} from '@expo-google-fonts/pangolin';
import { AppLoading } from 'expo-app-loading'
const db = SQLite.openDatabase('Todos');

export default function Edit({ route, navigation }) {
  const { date, id } = route.params;

  const [values, setValues] = React.useState(['Loading']);
  const [task, setTask] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [category, setCategory] = React.useState('');
  let [fontsLoaded] = useFonts({Pangolin_400Regular})

  const update = () => {
    db.transaction(async (tx) => {
      await tx.executeSql(
        'update todo set value=?, sub_tasks=?, category=? where id = ?',
        [task, description, category, id]
      );
    });
  };

  const deleteThis = () => {
    db.transaction(async (tx) => {
      await tx.executeSql(
        'delete from todo where id = ?',
        [id]
      );
    });
  };

  React.useState(async () => {
    await db.transaction(async (tx) => {
      await tx.executeSql(
        'select * from todo where id = ?',
        [id],
        (txt, { rows: _array }) => {
          setValues(_array._array);
          setTask(_array._array[0].value);
          setDescription(_array._array[0].sub_tasks);
          setCategory(_array._array[0].category);
        }
      );
    });
  }, [values]);

  if (!fontsLoaded) {
    return <Text>Loading...</Text>;
  } else {
  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <SafeAreaView style={styles.topContainer}>
        <View><Ionicons name="chevron-back" size={25} color="white" style={styles.topBack} onPress={() => navigation.goBack()} />
            <Text style={styles.appBarText}>Add a task</Text></View>
        <View style={styles.textAndInp}>
          <Text style={styles.topText}>Task:</Text>
          <TextInput
            style={styles.taskInput}
            onChangeText={(text) => setTask(text)}
            value={task}
            selectionColor='white'
          />
        </View>
        <View style={styles.textAndInp}>
          <Text style={styles.topText}>Description:</Text>
          <TextInput
            style={styles.taskInput}
            onChangeText={(text) => setDescription(text)}
            value={description}
            selectionColor='white'
          />
        </View>
        <View style={styles.textAndInp}>
          <Text style={styles.topText}>Category:</Text>
          <TextInput
            style={styles.taskInput}
            onChangeText={(text) => setCategory(text)}
            value={category}
            selectionColor='white'
          />
        </View>
        <View style={styles.timeView}>
          <Text style={styles.topText}>Scheduled Time</Text>
          <Text style={styles.topText}>
            {values == ['Loading'] ? 'Loading' : msToTime(values[0].time)}
          </Text>
        </View>
        <View style={[styles.timeView, {height: '10%'}]}>
        <TouchableOpacity
            style={styles.saveBtn}
            onPress={() => {
              update();
              navigation.goBack();
            }}>
            <Text style={[styles.topText, { color: 'blue' }]}>Update</Text>
          </TouchableOpacity> 
          <TouchableOpacity
            style={styles.saveBtn}
            onPress={() => {
              deleteThis();
              navigation.goBack();
            }}>
            <Text style={[styles.topText, { color: 'blue' }]}>Delete</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );}
}

const styles = StyleSheet.create({
  topContainer: {
    backgroundColor: 'blue',
    borderBottomRightRadius: 90,
  },
  topText: {
    fontWeight: 'bold',
    fontSize: 18,
    color: 'white',
    letterSpacing: 1.3,
  },
  taskInput: {
    width: '100%',
    height: '90%',
    borderBottomColor: 'white',
    borderTopColor: 'blue',
    borderRightColor: 'blue',
    borderLeftColor: 'blue',
    borderWidth: 2,
    fontSize: 20,
    paddingHorizontal: 10,
    paddingBottom: 0,
    marginTop: '3%',
    color: 'white',
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
  timeView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: '2%',
    paddingHorizontal: '5%',
    marginTop: '10%',
    marginBottom: '5%'
  },
  saveBtn: {
    height: '80%',
    width: '30%',
    borderRadius: 15,
    alignSelf: 'center',
    backgroundColor: 'white',
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
    marginBottom: -15,
    marginTop: '1%',
  },
  appBarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    alignSelf: 'center',
    marginBottom: '3%'
  },
  topBack: {
    position: 'absolute',
    top: '0%',
    left: '5%'
  }
});

function msToTime(duration) {
  var minutes = Math.floor((duration / (1000 * 60)) % 60),
    hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

  hours = hours < 10 ? '0' + hours : hours;
  minutes = minutes < 10 ? '0' + minutes : minutes;

  return hours + ':' + minutes;
}
