from pathlib import Path

from youwol.app.environment import YouwolEnvironment
from youwol.app.environment.models import IPipelineFactory
from youwol.app.routers.projects import BrowserApp, Execution, Link, BrowserAppGraphics, OpenWith
from youwol.pipelines.pipeline_typescript_weback_npm import pipeline, PipelineConfig, PublishConfig
from youwol.utils import parse_json, encode_id
from youwol.utils.context import Context

folder_path = Path(__file__).parent.parent
pkg_json = parse_json(folder_path / "package.json")
asset_id = encode_id(pkg_json['name'])
version = pkg_json['version']


class PipelineFactory(IPipelineFactory):

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

    async def get(self, env: YouwolEnvironment, context: Context):
        config = PipelineConfig(target=BrowserApp(
            displayName="CDN",
            execution=Execution(
                standalone=True,
                parametrized=[
                    OpenWith(
                        match={"kind": "package"},
                        parameters={"package-name": 'name'}
                    )
                ]
            ),
            links=[
                Link(name="doc", url="dist/docs/modules.html"),
                Link(name="coverage", url="coverage/lcov-report/index.html"),
                Link(name="bundle-analysis", url="dist/bundle-analysis.html")
            ],
            graphics=BrowserAppGraphics(
                appIcon=icon(size_px='100%', border_radius='15%', icon_path=app_icon),
                fileIcon=icon(size_px='100%', border_radius='15%', icon_path=file_icon, bg_size='contain'),
                background={
                    "class": "h-100 w-100",
                    "style": {
                        "opacity": 0.3,
                        "background-image": app_icon,
                        "background-size": "cover",
                        "background-repeat": "no-repeat",
                        "background-position": "center center",
                        "filter": "drop-shadow(rgb(0, 0, 0) 1px 3px 5px)",
                    }
                }
            ),
        ),
            publishConfig=PublishConfig(
                packagedFolders=["assets"],
            )
        )
        return await pipeline(config, context)


assets_dir = f"/api/assets-gateway/cdn-backend/resources/{asset_id}/{version}/assets"
app_icon = f"url('{assets_dir}/cdn_app.svg')"
file_icon = f"url('{assets_dir}/cdn_file.svg')"


def icon(size_px: str, border_radius: str, icon_path: str, bg_size: str = "cover"):
    return {
        "style": {
            "width": f"{size_px}",
            "height": f"{size_px}",
            "background-image": icon_path,
            "background-size": bg_size,
            "background-repeat": "no-repeat",
            "background-position": "center center",
            "filter": "drop-shadow(rgb(0, 0, 0) 1px 3px 5px)",
            "border-radius": f"{border_radius}",
        }
    }
