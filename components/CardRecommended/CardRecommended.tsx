import { useEffect, useState } from 'react'
import { View, Text, StyleSheet, Image, TouchableOpacity, ViewStyle } from 'react-native'
import { Bookmark, People, Location, TimeCircle, Wallet } from 'react-native-iconly'
import { useNavigation } from '@react-navigation/native'
import Loader from '../Loader/Loader'
import { db, storage } from '../../config/firebase'
import { doc, getDoc } from 'firebase/firestore'
import { getDownloadURL, ref } from 'firebase/storage'
import { HomeStackScreenProps } from '../../types'

type Props = {
  theme: boolean
  full: boolean
  jobId: string
  _style?: ViewStyle
  
}

const CardRecommended = ({ 
    theme,
    full,
    jobId,
    _style,
  }: Props) => {

  type Job = {
    Hirer: string,
    HirerUid: string,
    Title: string,
    Description: string,
    Time: string,
    Type: string,
    Competitors: number,
    Place: string,
    Salary: number,
    Posted: number
  }

  const navigation = useNavigation()

  const [saved, setSaved] = useState(true)
  const [image, setImage] = useState<string>()
  const [data, setData] = useState<Job>()
  const [isLoading, setIsLoading] = useState(true)


  const primaryColor   = theme ? '#FFF' : '#000'
  const secondaryColor = theme ? '#000' : '#FFF'
  
  const getData = async () => {
    // Fetch all job data out of the jobId given in the props
    const docRef = doc(db, `Jobs/${jobId}`)
    await getDoc(docRef).then((doc) => {
      if(doc.exists()) {
        // @ts-ignore
        setData(doc.data())
        data && getImage(data.HirerUid)
      }
    })

    
  }

  const getImage = async (uid: string) => {
    // Fetch the profile image url of the hirer
    await getDownloadURL(ref(storage, `Users/${uid}/Profile`))
    .then((url) => {
      setImage(url)
    })
    .catch((error) => {
      console.error('Error: ', error)
    })
    .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    getData()
  }, [data, image])


  if(data && image !== '')
  return (
    <View style={[_style, style.card, { backgroundColor: secondaryColor, height: full ? 200 : 120}]}>
      {/* @ts-ignore */}
      <TouchableOpacity style={style.section1} onPress={() => navigation.navigate('Job', {id: jobId})}>
          <Image 
            // @ts-ignore
            source={image != undefined ? {uri: image} : require('../../assets/images/DefaultProfile.png')}
            style={style.image}  
          />
          <View style={{flex: 1, flexDirection: 'column', justifyContent: 'space-evenly', paddingHorizontal: 10}}>
            <Text style={[style.title, {color: primaryColor}]}>{data.Title}</Text>
            <Text style={[style.hirer, {color: primaryColor}]}>{data.Hirer}</Text>
          </View>
          <TouchableOpacity onPress={() => {
              setSaved(!saved)
            }}>
            <Bookmark size={'medium'} set={saved ? 'bold' : 'light'} primaryColor={primaryColor} />
          </TouchableOpacity>
      </TouchableOpacity>
      {
        full ? 
        <>
          <View style={style.section2}>
            <Text style={[style.description, {color: primaryColor}]}>{data.Description}</Text>
          </View>
          <View style={style.section3}>
            <View style={{
              backgroundColor: theme ? 'rgba(255, 255, 255, 0.12)' : 'rgba(152, 152, 152, 0.12)',
              width: '30%',
              borderRadius: 2,
              justifyContent: 'center'
            }}>
              <Text style={[style.info, {color: primaryColor}]}>{data.Time}</Text>
            </View>
            <View style={{
              backgroundColor: theme ? 'rgba(255, 255, 255, 0.12)' : 'rgba(152, 152, 152, 0.12)',
              width: '30%',
              borderRadius: 2,
              justifyContent: 'center'
            }}>
              <Text style={[style.info, {color: primaryColor}]}>{data.Type}</Text>
            </View>
            <View style={{
              backgroundColor: theme ? 'rgba(255, 255, 255, 0.12)' : 'rgba(152, 152, 152, 0.12)',
              width: '30%',
              borderRadius: 2,
              justifyContent: 'center'
            }}>
              <Text style={[style.info, {color: primaryColor}]}>{'R$' + data.Salary}</Text>
            </View>
          </View>
        </>:<></>
        }
      <View style={[style.divider, { backgroundColor: theme ? 'rgba(255, 255, 255, 0.12)' : 'rgba(152, 152, 152, 0.12)' }]}></View>
      <View style={style.section4}>
        <View style={{ width: '27.5%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
          <People set={'light'} primaryColor={theme ? '#C4C4C4':'#000'}/>
          <Text style={{fontFamily: 'Poppins_400Regular', fontSize: 14, color: theme ? '#C4C4C4':'#000'}}>{data.Competitors}</Text>
        </View>
        {
          full ?
            <>
              <View style={{ width: '45%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                <Location set={'light'} primaryColor={theme ? '#C4C4C4':'#000'}/>
                <Text style={{fontFamily: 'Poppins_400Regular', fontSize: 14, color: theme ? '#C4C4C4':'#000'}}>{data.Place}</Text>
              </View>
            </>
          :
            <>
              <View style={{ width: '45%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                <Wallet set={'light'} primaryColor={theme ? '#C4C4C4':'#000'}/>
                <Text style={{fontFamily: 'Poppins_400Regular', fontSize: 14, color: theme ? '#C4C4C4':'#000'}}>{'R$' + data.Salary}</Text>
              </View>
            </>

        }
        
        <View style={{ width: '27.5%', flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center'}}>
          <TimeCircle set={'light'} primaryColor={theme ? '#C4C4C4':'#000'}/>
          <Text style={{fontFamily: 'Poppins_400Regular', fontSize: 14, color: theme ? '#C4C4C4':'#000'}}>{data.Posted + ' Dias'}</Text>
        </View> 
      </View>
    </View>
  )
  else return (
    <Loader />
  )
}

const style = StyleSheet.create({
  card: {
    width: '100%',
    padding: 20,
    borderRadius: 15,
  },
  section1: {
    width: '100%',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding:5
  },
  image: {
    width: 40,
    height: 40,
    borderRadius: 100
  },
  title: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 19,
    lineHeight: 25
  },
  hirer: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
  },
  section2: {
    padding:5,
    width: '100%',
  },
  description: {
    fontFamily: 'WorkSans_400Regular',
    fontSize: 17,
    marginVertical: 10
  },
  section3: {
    width: '100%',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  info: {
    width: '100%',
    fontFamily: 'Poppins_500Medium',
    fontSize: 15,
    textAlign: 'center',
  },
  divider: {
    width: '100%',
    height: 1,
    marginVertical: 10
  },
  section4: {
    width: '100%',
    flex: 1,
    flexDirection: 'row'
  }
})

export default CardRecommended