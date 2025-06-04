// TEMPORARILY DISABLED - Category Controller
// This controller is disabled to avoid database migration complexity
// All code is preserved and can be re-enabled when ready for migration

/*
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../roles-guard/roles.guard';
import { Roles } from '../roles-guard/CustomDecorator/custom_decorator';
import { Role } from '../roles-guard/roles.enum';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  async getAllCategories(
    @Query('includeInactive') includeInactive: string = 'false',
    @Query('hierarchy') hierarchy: string = 'false',
  ) {
    return this.categoryService.getAllCategories(
      includeInactive === 'true',
      hierarchy === 'true',
    );
  }

  @Get(':id')
  async getCategoryById(@Param('id') id: string) {
    return this.categoryService.getCategoryById(id);
  }

  @Get('slug/:slug')
  async getCategoryBySlug(@Param('slug') slug: string) {
    return this.categoryService.getCategoryBySlug(slug);
  }

  @Get(':id/products')
  async getCategoryProducts(
    @Param('id') id: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '12',
  ) {
    return this.categoryService.getCategoryProducts(
      id,
      parseInt(page),
      parseInt(limit),
    );
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  async createCategory(
    @Body()
    body: {
      name: string;
      description?: string;
      parentId?: string;
      isActive?: boolean;
      sortOrder?: number;
    },
  ) {
    return this.categoryService.createCategory(body);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  async updateCategory(
    @Param('id') id: string,
    @Body()
    body: {
      name?: string;
      description?: string;
      parentId?: string;
      isActive?: boolean;
      sortOrder?: number;
    },
  ) {
    return this.categoryService.updateCategory(id, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  async deleteCategory(@Param('id') id: string) {
    return this.categoryService.deleteCategory(id);
  }
}
*/

// Placeholder controller to avoid module errors
import { Controller } from '@nestjs/common';
import { CategoryService } from './category.service';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}
  // Temporarily disabled - all methods preserved above in comments
}
