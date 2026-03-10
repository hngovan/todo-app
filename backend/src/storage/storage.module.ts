import { Global, Module } from '@nestjs/common'
import { StorageController } from './storage.controller'
import { StorageService } from './storage.service'

@Global()
@Module({
  controllers: [StorageController],
  providers: [StorageService],
  exports: [StorageService]
})
// best-practice: arch-feature-modules, arch-module-sharing
export class StorageModule {}
