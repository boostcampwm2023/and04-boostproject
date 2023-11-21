package com.ohdodok.catchytape.core.data.di

import com.ohdodok.catchytape.core.data.repository.AuthRepositoryImpl
import com.ohdodok.catchytape.core.data.repository.MusicRepositoryImpl
import com.ohdodok.catchytape.core.domain.repository.AuthRepository
import com.ohdodok.catchytape.core.domain.repository.MusicRepository
import dagger.Binds
import dagger.Module
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent

@Module
@InstallIn(SingletonComponent::class)
interface RepositoryModule {

    @Binds
    fun bindAuthRepository(authRepositoryImpl: AuthRepositoryImpl): AuthRepository

    @Binds
    fun bindMusicRepository(musicRepositoryImpl: MusicRepositoryImpl): MusicRepository
}