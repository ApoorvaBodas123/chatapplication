import React, { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import assets from '../assets/assets'
import { AuthContext } from '../../context/AuthContext'

const ProfilePage = () => {

  const { authUser, updateProfile } = useContext(AuthContext);

  const navigate = useNavigate();

  const [selectedImg, setSelectedImg] = useState(null);
  const [name, setName] = useState(authUser?.fullName || "");
  const [bio, setBio] = useState(authUser?.bio || "");

  const profileImg =
    selectedImg
      ? URL.createObjectURL(selectedImg)
      : (authUser?.profilePic?.length > 0 ? authUser.profilePic : assets.avatar_icon);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // If only name/bio are changed
    if (!selectedImg) {
      await updateProfile({ fullName: name, bio });
      navigate("/");
      return;
    }

    // Convert selected image to base64
    const reader = new FileReader();
    reader.readAsDataURL(selectedImg);
    reader.onload = async () => {
      const base64Image = reader.result;
      await updateProfile({ profilePic: base64Image, fullName: name, bio });
      navigate('/');
    };
  };

  return (
    <div className='min-h-screen bg-cover bg-no-repeat flex items-center justify-center'>
      <div className='w-5/6 max-w-2xl text-white backdrop-blur-lg border-2
                      flex items-center justify-between border-gray-600 rounded-lg max-sm:flex-col-reverse'>

        <form onSubmit={handleSubmit} className='flex flex-col gap-5 p-10 flex-1'>
          <h3 className='text-lg'>Profile details</h3>

          <label htmlFor='avatar' className='flex items-center gap-3 cursor-pointer'>
            <input
              type='file'
              id='avatar'
              accept='.png,.jpeg,.jpg'
              hidden
              onChange={(e) => setSelectedImg(e.target.files[0])}
            />
            <img
              src={profileImg}
              className='w-12 h-12 rounded-full'
              alt='profile'
            />
            Upload profile image
          </label>

          <input
            type='text'
            value={name}
            required
            placeholder='Your name'
            onChange={(e) => setName(e.target.value)}
            className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200'
          />

          <textarea
            value={bio}
            required
            rows={4}
            placeholder='Write bio'
            onChange={(e) => setBio(e.target.value)}
            className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200'
          />

          <button
            type='submit'
            className='bg-gradient-to-r from-blue-400 to-violet-400 text-white p-2 rounded-full text-lg cursor-pointer'
          >
            Save
          </button>
        </form>

        <img
          src={profileImg}
          alt='profile'
          className='max-w-44 aspect-square rounded-full mx-10 max-sm:mt-10'
        />
      </div>
    </div>
  );
};

export default ProfilePage;
