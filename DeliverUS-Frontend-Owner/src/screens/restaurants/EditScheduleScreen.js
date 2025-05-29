import React, { useEffect, useState } from 'react'
import { Pressable, ScrollView, StyleSheet, View } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import InputItem from '../../components/InputItem'
import TextRegular from '../../components/TextRegular'
import * as GlobalStyles from '../../styles/GlobalStyles'
import { showMessage } from 'react-native-flash-message'
import * as yup from 'yup'
import { Formik } from 'formik'
import TextError from '../../components/TextError'
import { buildInitialValues } from '../Helper'
import { getRestaurantSchedule, updateSchedule } from '../../api/RestaurantEndpoints'

export default function EditScheduleScreen ({ navigation, route }) {
  /* SOLUTION */
  const [backendErrors, setBackendErrors] = useState()
  const [schedule, setSchedule] = useState()

  const [initialScheduleValues, setInitialScheduleValues] = useState({ startTime: null, endTime: null })
  const validationSchema = yup.object().shape({
    startTime: yup
      .string()
      .required('Start time is required')
      .matches(
        /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/,
        'The time must be in the HH:mm (e.g. 14:30:00) format'
      ),
    endTime: yup
      .string()
      .required('End time is required')
      .matches(
        /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/,
        'The time must be in the HH:mm (e.g. 14:30:00) format'
      )
  })

  useEffect(() => {
    async function fetchScheduleDetail () {
      try {
        const fetchedSchedule = await getRestaurantSchedule(route.params.restaurantId, route.params.scheduleId)
        setSchedule(fetchedSchedule)
        setInitialScheduleValues(buildInitialValues(fetchedSchedule, initialScheduleValues))
      } catch (error) {
        showMessage({
          message: `There was an error while retrieving schedule details (id ${route.params.id}). ${error}`,
          type: 'error',
          style: GlobalStyles.flashStyle,
          titleStyle: GlobalStyles.flashTextStyle
        })
      }
    }
    fetchScheduleDetail()
  }, [route])

  const update = async (values) => {
    setBackendErrors([])
    try {
      const updatedSchedule = await updateSchedule(schedule.restaurantId, schedule.id, values)
      showMessage({
        message: `Schedule id ${updatedSchedule.id} succesfully updated`,
        type: 'success',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
      navigation.navigate('RestaurantDetailScreen', { id: schedule.restaurantId })
    } catch (error) {
      console.log(error)
      setBackendErrors(error.errors)
    }
  }
  return (
    <Formik
      enableReinitialize
      validationSchema={validationSchema}
      initialValues={initialScheduleValues}
      onSubmit={update}>
      {({ handleSubmit, setFieldValue, values }) => (
        <ScrollView>
          <View style={{ alignItems: 'center' }}>
            <View style={{ width: '60%' }}>
              <InputItem
                name='startTime'
                label='Start Time (HH:mm:ss):'
              />
              <InputItem
                name='endTime'
                label='End Time (HH:mm:ss):'
              />

              {backendErrors &&
                backendErrors.map((error, index) => <TextError key={index}>{error.param}-{error.msg}</TextError>)
              }

              <Pressable
                onPress={ handleSubmit }
                style={({ pressed }) => [
                  {
                    backgroundColor: pressed
                      ? GlobalStyles.brandSuccessTap
                      : GlobalStyles.brandSuccess
                  },
                  styles.button
                ]}>
                <View style={[{ flex: 1, flexDirection: 'row', justifyContent: 'center' }]}>
                  <MaterialCommunityIcons name='content-save' color={'white'} size={20}/>
                  <TextRegular textStyle={styles.text}>
                    Save
                  </TextRegular>
                </View>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      )}
    </Formik>
  )
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    height: 40,
    padding: 10,
    width: '100%',
    marginTop: 20,
    marginBottom: 20
  },
  text: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    marginLeft: 5

  }
})
