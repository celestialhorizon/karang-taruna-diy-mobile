import React from 'react';
import { View, Dimensions } from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';

interface StepVideoProps {
  uri: string;
}

export function StepVideo({ uri }: StepVideoProps) {
  const player = useVideoPlayer(uri);

  return (
    <View style={{ width: '100%', height: 220, borderRadius: 12, marginBottom: 16, overflow: 'hidden', backgroundColor: '#000' }}>
      <VideoView
        player={player}
        style={{ width: '100%', height: '100%' }}
        contentFit="contain"
        allowsFullscreen={true}
        allowsPictureInPicture={false}
        nativeControls={true}
      />
    </View>
  );
}
