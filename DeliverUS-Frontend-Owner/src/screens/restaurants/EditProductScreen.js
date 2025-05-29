import React, { useEffect, useState } from 'react'
import { Image, Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native'
import * as ExpoImagePicker from 'expo-image-picker'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import InputItem from '../../components/InputItem'
import TextRegular from '../../components/TextRegular'
import * as GlobalStyles from '../../styles/GlobalStyles'
import defaultProductImage from '../../../assets/product.jpeg'
import { showMessage } from 'react-native-flash-message'
import DropDownPicker from 'react-native-dropdown-picker'
import * as yup from 'yup'
import { ErrorMessage, Formik } from 'formik'
import TextError from '../../components/TextError'
import { getProductCategories, getDetail, update } from '../../api/ProductEndpoints'
import { prepareEntityImages } from '../../api/helpers/FileUploadHelper'
import { buildInitialValues } from '../Helper'
import { getRestaurantSchedules } from '../../api/RestaurantEndpoints'

export default function EditProductScreen ({ navigation, route }) {
  const [open, setOpen] = useState(false)
  /* SOLUTION */
  const [isScheduleDropdownOpen, setIsScheduleDropdownOpen] = useState(false)
  const [productCategories, setProductCategories] = useState([])
  const [backendErrors, setBackendErrors] = useState()
  const [product, setProduct] = useState()
  /* SOLUTION */
  const [scheduleOptions, setScheduleOptions] = useState([])

  const [initialProductValues, setInitialProductValues] = useState({ name: null, description: null, price: null, order: null, productCategoryId: null, availability: null, image: null /* SOLUTION */, scheduleId: null })
  const validationSchema = yup.object().shape({
    name: yup
      .string()
      .max(255, 'Name too long')
      .required('Name is required'),
    price: yup
      .number()
      .positive('Please provide a positive price value')
      .required('Price is required'),
    order: yup
      .number()
      .nullable()
      .positive('Please provide a positive order value')
      .integer('Please provide an integer order value'),
    availability: yup
      .boolean(),
    productCategoryId: yup
      .number()
      .positive()
      .integer()
      .required('Product category is required'), /* SOLUTION */
    scheduleId: yup
      .number()
      .nullable()
      .optional()
      .positive()
  })

  useEffect(() => {
    async function fetchProductCategories () {
      try {
        const fetchedProductCategories = await getProductCategories()
        const fetchedProductCategoriesReshaped = fetchedProductCategories.map((e) => {
          return {
            label: e.name,
            value: e.id
          }
        })
        setProductCategories(fetchedProductCategoriesReshaped)
      } catch (error) {
        showMessage({
          message: `There was an error while retrieving product categories. ${error} `,
          type: 'error',
          style: GlobalStyles.flashStyle,
          titleStyle: GlobalStyles.flashTextStyle
        })
      }
    }
    fetchProductCategories()
  }, [])

  useEffect(() => {
    async function fetchProductDetail () {
      try {
        const fetchedProduct = await getDetail(route.params.id)
        const preparedProduct = prepareEntityImages(fetchedProduct, ['image'])
        setProduct(preparedProduct)
        const initialValues = buildInitialValues(preparedProduct, initialProductValues)
        setInitialProductValues(initialValues)
      } catch (error) {
        showMessage({
          message: `There was an error while retrieving product details (id ${route.params.id}). ${error}`,
          type: 'error',
          style: GlobalStyles.flashStyle,
          titleStyle: GlobalStyles.flashTextStyle
        })
      }
    }
    fetchProductDetail()
  }, [route])

  /* SOLUTION */
  useEffect(() => {
    async function fetchRestaurantSchedules () {
      try {
        const fetchedRestaurantSchedules = await getRestaurantSchedules(product.restaurantId)
        const fetchedRestaurantSchedulesOptions = fetchedRestaurantSchedules.map((schedule) => {
          return {
            label: `${schedule.startTime} - ${schedule.endTime}`,
            value: schedule.id
          }
        })
        setScheduleOptions(fetchedRestaurantSchedulesOptions)
      } catch (error) {
        showMessage({
          message: `There was an error while retrieving restaurant schedules. ${error} `,
          type: 'error',
          style: GlobalStyles.flashStyle,
          titleStyle: GlobalStyles.flashTextStyle
        })
      }
    }
    if (product) { fetchRestaurantSchedules() }
  }, [product])

  const pickImage = async (onSuccess) => {
    const result = await ExpoImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1
    })
    if (!result.canceled) {
      if (onSuccess) {
        onSuccess(result)
      }
    }
  }

  const updateProduct = async (values) => {
    setBackendErrors([])
    try {
      const updatedProduct = await update(product.id, values)
      showMessage({
        message: `Product ${updatedProduct.name} succesfully updated`,
        type: 'success',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
      navigation.navigate('RestaurantDetailScreen', { id: product.restaurantId })
    } catch (error) {
      console.log(error)
      setBackendErrors(error.errors)
    }
  }
  return (
    <Formik
      enableReinitialize
      validationSchema={validationSchema}
      initialValues={initialProductValues}
      onSubmit={updateProduct}>
      {({ handleSubmit, setFieldValue, values }) => (
        <ScrollView>
          <View style={{ alignItems: 'center' }}>
            <View style={{ width: '60%' }}>
              <InputItem
                name='name'
                label='Name:'
              />
              <InputItem
                name='description'
                label='Description:'
              />
              <InputItem
                name='price'
                label='Price:'
              />

              <InputItem
                name='order'
                label='Order/position to be rendered:'
              />

              <TextRegular textStyle={styles.textLabel}>Product category: </TextRegular>
              <DropDownPicker
                open={open}
                value={values.productCategoryId}
                items={productCategories}
                setOpen={setOpen}
                onSelectItem={item => {
                  setFieldValue('productCategoryId', item.value)
                }}
                setItems={setProductCategories}
                placeholder="Select the product category"
                containerStyle={{ height: 40, marginBottom: 10 }}
                style={{ backgroundColor: GlobalStyles.brandBackground }}
                dropDownStyle={{ backgroundColor: '#fafafa' }}
              />
              <ErrorMessage name={'productCategoryId'} render={msg => <TextError>{msg}</TextError> }/>
 {/* SOLUTION */}
 <TextRegular textStyle={styles.textLabel}>Schedule: </TextRegular>
              <DropDownPicker
                open={isScheduleDropdownOpen}
                value={values.scheduleId}
                items={[
                  { label: 'Not scheduled', value: null },
                  ...scheduleOptions
                ]}
                setOpen={setIsScheduleDropdownOpen}
                onSelectItem={item => {
                  setFieldValue('scheduleId', item.value)
                }}
                setItems={setScheduleOptions}
                placeholder="Not scheduled"
                containerStyle={{ height: 40, marginBottom: 10 }}
                style={{ backgroundColor: GlobalStyles.brandBackground }}
                dropDownStyle={{ backgroundColor: '#fafafa' }}
              />
              <ErrorMessage name={'scheduleId'} render={msg => <TextError>{msg}</TextError> }/>

              <TextRegular textStyle={styles.textLabel}>Available:</TextRegular>
              <Switch
                trackColor={{ false: GlobalStyles.brandSecondary, true: GlobalStyles.brandPrimary }}
                thumbColor={values.availability ? GlobalStyles.brandSecondary : '#f4f3f4'}
                // onValueChange={toggleSwitch}
                value={values.availability}
                style={styles.switch}
                onValueChange={value =>
                  setFieldValue('availability', value)
                }
              />
              <ErrorMessage name={'availability'} render={msg => <TextError>{msg}</TextError> }/>

              <Pressable onPress={() =>
                pickImage(
                  async result => {
                    await setFieldValue('image', result)
                  }
                )
              }
                style={styles.imagePicker}
              >
                <TextRegular textStyle={styles.label}>Product image: </TextRegular>
                <Image style={styles.image} source={values.image ? { uri: values.image.assets[0].uri } : defaultProductImage} />
              </Pressable>

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

  },
  imagePicker: {
    height: 40,
    paddingLeft: 10,
    marginTop: 10,
    marginBottom: 80
  },
  image: {
    width: 100,
    height: 100,
    borderWidth: 1,
    alignSelf: 'center',
    marginTop: 5
  },
  switch: {
    marginTop: 0
  },
  textLabel: {
    marginTop: 10,
    marginBottom: 5,
    marginLeft: 10,
    fontSize: 12
  }
})
