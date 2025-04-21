// src/components/users/UserProfile.js
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Avatar,
  TextField,
  Button,
  Grid,
  Box,
  IconButton
} from '@mui/material';
import { Edit, Save, Cancel, PhotoCamera } from '@mui/icons-material';
import LoadingOverlay from '../common/LoadingOverlay';
import ErrorAlert from '../common/ErrorAlert';
import { updateProfile, uploadAvatar } from '../../services/api';

const UserProfile = () => {
  const [profile, setProfile] = useState({
    username: '',
    email: '',
    avatar_url: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Load profile data
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    setProfile(userData);
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset to original data
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    setProfile(userData);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const response = await updateProfile(profile);
      localStorage.setItem('user', JSON.stringify(response.data));
      setIsEditing(false);
      setError(null);
    } catch (err) {
      setError('Không thể cập nhật thông tin. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await uploadAvatar(formData);
      setProfile(prev => ({
        ...prev,
        avatar_url: response.data.avatar_url
      }));
      setError(null);
    } catch (err) {
      setError('Không thể tải lên ảnh đại diện. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <LoadingOverlay open={loading} />
      <CardHeader title="Thông tin cá nhân" />
      <CardContent>
        {error && (
          <ErrorAlert
            severity="error"
            message={error}
            onRetry={() => setError(null)}
          />
        )}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
          <Box sx={{ position: 'relative' }}>
            <Avatar
              src={profile.avatar_url}
              sx={{ width: 100, height: 100 }}
            />
            <input
              accept="image/*"
              type="file"
              id="avatar-upload"
              onChange={handleAvatarUpload}
              style={{ display: 'none' }}
            />
            <label htmlFor="avatar-upload">
              <IconButton
                component="span"
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  backgroundColor: 'primary.main',
                  color: 'white',
                  '&:hover': { backgroundColor: 'primary.dark' }
                }}
              >
                <PhotoCamera />
              </IconButton>
            </label>
          </Box>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Tên người dùng"
              value={profile.username}
              onChange={(e) => setProfile({ ...profile, username: e.target.value })}
              disabled={!isEditing}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              disabled={!isEditing}
            />
          </Grid>
        </Grid>

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          {!isEditing ? (
            <Button
              variant="contained"
              startIcon={<Edit />}
              onClick={handleEdit}
            >
              Chỉnh sửa
            </Button>
          ) : (
            <>
              <Button
                variant="outlined"
                startIcon={<Cancel />}
                onClick={handleCancel}
              >
                Hủy
              </Button>
              <Button
                variant="contained"
                startIcon={<Save />}
                onClick={handleSave}
              >
                Lưu
              </Button>
            </>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default UserProfile;