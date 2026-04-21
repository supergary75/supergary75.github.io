$ErrorActionPreference = 'Stop'

$edge = 'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
$qpdf = 'C:\Program Files (x86)\MasterPDF\pdf_tool\qpdf.exe'
$root = Split-Path -Parent $PSCommandPath
$profile = Join-Path $root 'edge-batch-profile'
$parts = Join-Path $root 'assets\pdf\parts'
$finalDir = Join-Path $root 'assets\pdf'
$final = Join-Path $finalDir 'makex-full-overview.pdf'

New-Item -ItemType Directory -Force -Path $profile, $parts, $finalDir | Out-Null
Get-ChildItem -Path $parts -Filter '*.pdf' -ErrorAction SilentlyContinue | Remove-Item -Force -ErrorAction SilentlyContinue
Remove-Item -LiteralPath $final -Force -ErrorAction SilentlyContinue

$pages = @(
  @{ name = '01-index'; src = 'file:///D:/Codex/index.html' },
  @{ name = '02-module1-detail'; src = 'file:///D:/Codex/module1-detail.html' },
  @{ name = '03-module1'; src = 'file:///D:/Codex/module1.html' },
  @{ name = '04-module2-overview'; src = 'file:///D:/Codex/module2-overview.html' },
  @{ name = '05-module2-detail'; src = 'file:///D:/Codex/module2-detail.html' },
  @{ name = '06-module2-robot-design'; src = 'file:///D:/Codex/module2-robot-design.html' },
  @{ name = '07-module2-parameter-demo'; src = 'file:///D:/Codex/module2-parameter-demo.html' },
  @{ name = '08-module2-competition-planning'; src = 'file:///D:/Codex/module2-competition-planning.html' },
  @{ name = '09-module2-competition-planning-v2'; src = 'file:///D:/Codex/module2-competition-planning-v2.html' },
  @{ name = '10-module2-inspire-detail'; src = 'file:///D:/Codex/module2-inspire-detail.html' },
  @{ name = '11-module2-starter-detail'; src = 'file:///D:/Codex/module2-starter-detail.html' },
  @{ name = '12-module2-explorer-detail'; src = 'file:///D:/Codex/module2-explorer-detail.html' },
  @{ name = '13-module2-challenge-detail'; src = 'file:///D:/Codex/module2-challenge-detail.html' },
  @{ name = '14-module3-detail'; src = 'file:///D:/Codex/module3-detail.html' },
  @{ name = '15-module3-knowledge-detail'; src = 'file:///D:/Codex/module3-knowledge-detail.html' },
  @{ name = '16-module3-data-platform'; src = 'file:///D:/Codex/module3-data-platform.html' },
  @{ name = '17-module3-data-platform-analysis'; src = 'file:///D:/Codex/module3-data-platform-analysis.html' },
  @{ name = '18-module3-curriculum-detail'; src = 'file:///D:/Codex/module3-curriculum-detail.html' },
  @{ name = '19-module3-training-detail'; src = 'file:///D:/Codex/module3-training-detail.html' },
  @{ name = '20-personal-intro'; src = 'file:///D:/Codex/personal-intro.html' },
  @{ name = '21-tmp-competitive-ranking-board'; src = 'file:///D:/Codex/tmp_competitive_ranking_board.html' },
  @{ name = '22-competitive-ranking-board'; src = 'file:///D:/Codex/competitive-ranking-board/index.html' }
)

foreach ($page in $pages) {
  $out = Join-Path $parts ($page.name + '.pdf')
  $edgeArgs = @(
    '--headless',
    '--disable-gpu',
    '--disable-crash-reporter',
    '--allow-file-access-from-files',
    "--user-data-dir=$profile",
    '--virtual-time-budget=15000',
    "--print-to-pdf=$out",
    $page.src
  )
  & $edge @edgeArgs | Out-Null
  if (-not (Test-Path $out)) {
    throw "Failed to create $out"
  }
}

$inputs = $pages | ForEach-Object { Join-Path $parts ($_.name + '.pdf') }
$mergeArgs = @('--empty', '--pages') + $inputs + @('--', $final)
& $qpdf @mergeArgs | Out-Null

if (-not (Test-Path $final)) {
  throw "Failed to merge final PDF"
}

Write-Host "Created $final"
