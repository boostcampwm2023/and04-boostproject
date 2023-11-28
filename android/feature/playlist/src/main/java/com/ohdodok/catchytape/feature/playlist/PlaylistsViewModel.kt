package com.ohdodok.catchytape.feature.playlist

import androidx.lifecycle.ViewModel
import com.ohdodok.catchytape.core.domain.model.Playlist
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import javax.inject.Inject

data class PlaylistUiState(
    // TODO: 임시 데이터이고 수정해야함
    val playList: List<Playlist> = listOf(
        Playlist(
            1,
            "최근 재생 목록",
            "~~~~",
            22
        )
    )
)

@HiltViewModel
class PlaylistViewModel @Inject constructor(

) : ViewModel() {

    private val _uiState = MutableStateFlow(PlaylistUiState())
    val uiState: StateFlow<PlaylistUiState> = _uiState.asStateFlow()
}