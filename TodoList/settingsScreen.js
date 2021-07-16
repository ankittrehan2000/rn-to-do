import * as React from "react";
import {
  View,
  Text,
  Button,
  Platform,
  AsyncStorage,
  TextInput,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  Animated,
} from "react-native";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import * as Permissions from "expo-permissions";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons, AntDesign } from "@expo/vector-icons";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function Settings({ navigation }) {
  const [time, setTime] = React.useState(0);
  const [showTime, setShowTime] = React.useState(new Date());
  const [name, setName] = React.useState("");
  const [modal, setModal] = React.useState(false);

  React.useEffect(() => {
    _retrieveData();
  }, []);

  const _storeData = async (name) => {
    try {
      await AsyncStorage.setItem("Name", name);
      FadeInView();
    } catch (error) {
      alert("Error storing your name");
    }
  };

  const _retrieveData = async () => {
    try {
      const value = await AsyncStorage.getItem("Name");
      if (value !== null) {
        // We have data!!
        setName(value);
      }
    } catch (error) {
      // Error retrieving data
      console.log("error");
    }
  };

  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  const FadeInView = (props) => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start(() => fadeOut());
  };

  const fadeOut = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 2000,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <View style={styles.bcg}>
        <SafeAreaView
          style={{ flexDirection: "column", justifyContent: "space-between" }}
        >
          <View>
            <Ionicons
              name="chevron-back"
              size={25}
              color="white"
              style={styles.topBack}
              onPress={() => navigation.goBack()}
            />
            <Text style={styles.appBar}>Settings</Text>
            <Animated.View
              style={{
                opacity: fadeAnim,
                height: "100%",
                position: "absolute",
                top: "10%",
                width: "25%",
                right: "5%",
                borderRadius: 25,
                backgroundColor: "green",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                alignContent: "center",
              }}
            >
              <Text
                style={{
                  alignSelf: "center",
                  color: "white",
                  fontWeight: "bold",
                  fontSize: 18,
                }}
              >
                Saved!
              </Text>
            </Animated.View>
          </View>
          <View
            style={{
              backgroundColor: "white",
              height: 2,
              width: "90%",
              marginLeft: "5%",
              marginTop: "5%",
              marginBottom: "2%",
            }}
          />
          <TouchableOpacity
            style={styles.timePicker}
            onPress={() => setModal(true)}
          >
            <View style={{ display: "flex", flexDirection: "column" }}>
              <Text style={styles.pickText}>
                Pick a time for daily reminders
              </Text>
            </View>
            <AntDesign name="arrowright" size={25} color="white" />
          </TouchableOpacity>
          <Modal animationType="slide" transparent={true} visible={modal}>
            <View
              style={{
                alignSelf: "center",
                opacity: 0.93,
                backgroundColor: "black",
                width: "100%",
                height: "100%",
              }}
            >
              <View
                style={{
                  alignItems: "center",
                  top: "25%",
                  width: "80%",
                  height: "50%",
                  backgroundColor: "blue",
                  borderRadius: 15,
                  left: "10%",
                }}
              >
                <DateTimePicker
                  textColor="white"
                  mode="time"
                  display="spinner"
                  value={showTime}
                  style={{ height: "80%", width: "90%", color: "white" }}
                  onChange={(event, evtime) => {
                    setShowTime(evtime);
                    setTime(
                      evtime.getTime() -
                        new Date().getTimezoneOffset() * 60 * 1000
                    );
                  }}
                />
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-around",
                    width: "100%",
                  }}
                >
                  <TouchableOpacity
                    onPress={async () => {
                      await registerForPushNotificationsAsync();
                      const timing = await msToTime(time);
                      await Notifications.cancelAllScheduledNotificationsAsync();
                      await schedulePushNotification(
                        parseInt(timing[0]),
                        parseInt(timing[1])
                      );
                      if (!registerForPushNotificationsAsync()) setModal(true);
                      else setModal(false);
                      FadeInView();
                    }}
                    style={{
                      backgroundColor: "white",
                      padding: "5%",
                      borderRadius: 20,
                    }}
                  >
                    <Text
                      style={{
                        color: "blue",
                        fontSize: 18,
                        fontWeight: "bold",
                      }}
                    >
                      Remind at that time
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      setModal(false);
                    }}
                    style={{
                      backgroundColor: "white",
                      padding: "5%",
                      borderRadius: 20,
                    }}
                  >
                    <Text
                      style={{
                        color: "blue",
                        fontSize: 18,
                        fontWeight: "bold",
                      }}
                    >
                      Cancel
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
          <View
            style={{
              backgroundColor: "white",
              height: 2,
              width: "90%",
              marginLeft: "5%",
              marginBottom: "10%",
            }}
          />
          <View style={styles.nameInput}>
            <View
              style={{
                height: "100%",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <Text style={styles.name}>Enter Name:</Text>
              <Text style={styles.subTitle}>Limit to 10 characters</Text>
            </View>
            <TextInput
              style={styles.input}
              onChangeText={(text) => setName(text)}
              maxLength={10}
              backgroundColor="blue"
              value={name}
              selectionColor="white"
            />
          </View>
          <TouchableOpacity
            onPress={() => {
              _storeData(name);
            }}
            style={styles.updateBtn}
          >
            <Text style={styles.updateText}>Save Name</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  appBar: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    alignSelf: "center",
  },
  bcg: {
    backgroundColor: "blue",
    borderBottomLeftRadius: 70,
    borderBottomRightRadius: 70,
    width: "100%",
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  nameInput: {
    width: "100%",
    paddingLeft: "5%",
    paddingRight: "5%",
    marginBottom: "10%",
    flexDirection: "row",
    justifyContent: "space-between",
    height: 50,
    alignItems: "center",
    alignContent: "center",
  },
  input: {
    height: "100%",
    width: "40%",
    paddingHorizontal: "5%",
    paddingVertical: "1%",
    fontSize: 18,
    color: "white",
    borderTopColor: "blue",
    borderLeftColor: "blue",
    borderRightColor: "blue",
    borderColor: "white",
    borderWidth: 2,
    fontFamily: "Pangolin_400Regular",
  },
  updateBtn: {
    height: "15%",
    width: "30%",
    marginBottom: "10%",
    alignSelf: "center",
    backgroundColor: "white",
    justifyContent: "center",
    alignContent: "center",
    alignItems: "center",
    borderRadius: 20,
  },
  updateText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "blue",
  },
  subTitle: {
    color: "white",
    fontSize: 10,
  },
  timePicker: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: "7%",
    paddingLeft: "5%",
    paddingRight: "5%",
  },
  pickText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  topBack: {
    position: "absolute",
    top: "0%",
    left: "5%",
  },
});

function msToTime(duration) {
  var minutes = Math.floor((duration / (1000 * 60)) % 60),
    hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
  return [hours, minutes];
}

async function schedulePushNotification(hours, minutes) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Check out your work day",
      body: "Look at what you could accomplish today",
    },
    trigger: { hour: hours, minute: minutes, repeats: true, type: "daily" },
  });
}

async function registerForPushNotificationsAsync() {
  if (Constants.isDevice) {
    const { status: existingStatus } = await Permissions.getAsync(
      Permissions.NOTIFICATIONS
    );
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      alert(
        "Please enable notifications in settings to stay updated with your tasks"
      );
      return false;
    }
  } else {
    alert("Something went wrong when trying to set up notifications");
  }

  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }
}
