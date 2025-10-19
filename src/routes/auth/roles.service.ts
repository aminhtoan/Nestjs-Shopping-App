import { Injectable } from '@nestjs/common'
import { RoleName } from 'src/shared/constants/role.constant'
import { PrismaService } from 'src/shared/services/prisma.service'

@Injectable()
export class RolesService {
  private clientRoledId: number | null = null

  constructor(private readonly prismaService: PrismaService) {}

  async getClientRoleId() {
    if (this.clientRoledId) {
      return this.clientRoledId
    }

    const role = await this.prismaService.role.findFirstOrThrow({
      where: {
        name: RoleName.Client,
      },
    })

    this.clientRoledId = role.id
    return role.id
  }
}
