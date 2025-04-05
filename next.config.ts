import type { NextConfig } from 'next';
import type { Configuration } from 'webpack';

const nextConfig: NextConfig = {
  webpack: (config: Configuration) => {
    config.module?.rules?.push({
      test: /\.js\.map$/,
      type: 'asset/resource',
      generator: {
        filename: 'static/ignored/[hash][ext][query]',
      },
    });

    return config;
  },
};

export default nextConfig;
