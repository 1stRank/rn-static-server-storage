/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {useEffect, useState} from 'react';
import type {Node} from 'react';
import {WebView} from 'react-native-webview';
import {NativeSyntheticEvent} from "react-native";
import {
  Button,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  TextInput,
  useColorScheme,
  View,
} from 'react-native';
import StaticServer from 'react-native-static-server';
import RNFS from 'react-native-fs';

import {Colors} from 'react-native/Libraries/NewAppScreen';

const NO_IMAGE_LINK = "https://vanhoadoanhnghiepvn.vn/wp-content/uploads/2020/08/112815953-stock-vector-no-image-available-icon-flat-vector.jpg";
const NO_IMAGE_NAME = "no-image.jpeg";
const OUTPUT_IMAGE_NAME = "temp.jpeg";

const App: () => Node = () => {
  const path = `${Platform.OS === 'ios' ? RNFS.MainBundlePath : RNFS.DocumentDirectoryPath}/www`;
  const isDarkMode = useColorScheme() === 'dark';
  const [isDone, setIsDone] = useState(false);
  const [link, setLink] = useState();
  const [imgURL, setImgURL] = useState();
  const [imageVersion, setImageVersion] = useState(1);

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const onDownloadImage = (url: String, name: String) => {
    if (!url?.trim() && !name?.trim()) return;

    RNFS.downloadFile({
      fromUrl: url,
      toFile: `${path}/${name}`,
    }).promise.then((r: any) => {
      console.log(r);
      setImageVersion(imageVersion + 1);
      setIsDone(true);
    }).catch(console.log);
  };

  useEffect(() => {
    const server = new StaticServer(8080, path);

    // Start the server
    server.start().then(async (url: any) => {
      console.log('Serving at URL', url);
      const isExist: Boolean = await RNFS.exists(path);
      const isExistImage: Boolean = await RNFS.exists(path + `/${NO_IMAGE_NAME}`);

      if (!isExist) await RNFS.mkdir(path);
      if (!isExistImage) onDownloadImage(NO_IMAGE_LINK, NO_IMAGE_NAME);

      setLink(url);
    });
  }, []);

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        <View
          {...{
            style: [
              {backgroundColor: isDarkMode ? Colors.black : Colors.white},
              styles.container,
            ],
          }}>
          <TextInput
            {...{
              style: styles.input,
              placeholder: 'Input image url in here...',
              onChangeText: (txt) => {
                setImgURL(txt);
              },
            }}
          />
          <Button
            {...{
              title: 'GET',
              color: 'red',
              onPress: () => onDownloadImage(imgURL, OUTPUT_IMAGE_NAME),
            }}
          />
          {link && <WebView
            {...{
              style: {height: 200, resizeMode: 'stretch', margin: 5},
              source: {uri: isDone ? `${link}/${OUTPUT_IMAGE_NAME}?v=${imageVersion}` : `${link}/${NO_IMAGE_NAME}`},
            }}
          />}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  input: {
    borderColor: 'grey',
    borderWidth: 1,
    height: 30,
    borderRadius: 5,
  },
  container: {
    display: 'flex',
    padding: 10,
  },
});

export default App;
