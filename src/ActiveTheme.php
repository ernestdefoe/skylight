<?php

/*
 * This file is part of ernestdefoe/skylight.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace ErnestDefoe\Skylight;

use Flarum\Extension\ExtensionManager;
use Flarum\Http\RequestUtil;
use Illuminate\Contracts\Container\Container;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Log\LoggerInterface;

/**
 * Is this visitor looking at Skylight?
 *
 * Every Skylight rule hangs off <html data-sky>, so answering "no" here turns
 * the whole theme off for that page, and the stylesheet costs nothing.
 *
 * - ernestdefoe/wardrobe enabled: yes only for visitors on Skylight.
 * - Bespoke enabled without Wardrobe: no. Two themes styling the same page
 *   fight; the admin page says to offer Skylight through Wardrobe instead.
 * - Otherwise: yes.
 *
 * 🚨 Soft: Wardrobe is never required and its classes are named as strings.
 */
final class ActiveTheme
{
    public const ID = 'ernestdefoe-skylight';

    private const REGISTRY = 'Ernestdefoe\\Wardrobe\\ThemeRegistry';

    /** @var \WeakMap<ServerRequestInterface, bool>|null */
    private static ?\WeakMap $answers = null;

    private static bool $logged = false;

    public function __construct(protected ExtensionManager $extensions, protected Container $container, protected LoggerInterface $logger)
    {
    }

    public function blockedByBespoke(): bool
    {
        return $this->extensions->isEnabled('ernestdefoe-bespoke') && ! $this->wardrobe();
    }

    public function for(?ServerRequestInterface $request): bool
    {
        if ($this->blockedByBespoke()) {
            return false;
        }

        if (! $request || ! $this->wardrobe()) {
            return true;
        }

        self::$answers ??= new \WeakMap();

        return self::$answers[$request] ??= $this->ask($request);
    }

    private function wardrobe(): bool
    {
        return $this->extensions->isEnabled('ernestdefoe-wardrobe') && class_exists(self::REGISTRY);
    }

    private function ask(ServerRequestInterface $request): bool
    {
        try {
            $cookie = $request->getCookieParams()['wardrobe_theme'] ?? null;
            $chosen = $this->container->make(self::REGISTRY)->resolve(RequestUtil::getActor($request), is_string($cookie) ? $cookie : null);
        } catch (\Throwable $e) {
            if (! self::$logged) {
                self::$logged = true;
                $this->logger->warning('Skylight: Wardrobe could not resolve the visitor\'s theme, so Skylight serves as the only theme: '.$e->getMessage(), ['exception' => $e]);
            }

            return true;
        }

        // null: Wardrobe serves the shared stylesheet with every enabled theme
        // in it. Skylight then styles the page only when Bespoke is not there too.
        return $chosen === self::ID || ($chosen === null && ! $this->extensions->isEnabled('ernestdefoe-bespoke'));
    }
}
